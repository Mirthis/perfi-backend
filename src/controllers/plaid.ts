import {
  AccountBase,
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  RemovedTransaction,
  Transaction,
} from 'plaid';
import express, { Request, Response, NextFunction } from 'express';
import { Item } from '../models';
import { isAuthenticated } from '../utils/auth';
import config from '../utils/config';
import { createOrUpdateInstitution } from '../models/institution';
import {
  createOrUpdateItem,
  getItemByPlaidItemId,
  updateItemTransactionsCursor,
} from '../models/item';
import { createOrUpdateTransactions } from '../models/transaction';
import { createOrUpdateAccounts } from '../models/account';

const router = express.Router();

const configuration = new Configuration({
  basePath: PlaidEnvironments[config.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': config.PLAID_CLIENT_ID,
      'PLAID-SECRET': config.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

const fetchTransactionUpdates = async (plaidItemId: string) => {
  const { accessToken, transactionCursor: lastCursor } =
    (await getItemByPlaidItemId(plaidItemId)) as Item;

  let cursor = lastCursor;

  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  let removed: RemovedTransaction[] = [];
  let hasMore: boolean = true;

  const batchSize = 100;
  try {
    /* eslint-disable no-await-in-loop */
    while (hasMore) {
      const request = {
        access_token: accessToken,
        cursor: cursor || undefined,
        count: batchSize,
      };
      const { data } = await plaidClient.transactionsSync(request);
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }
  } catch (err: unknown) {
    console.error(`Error fetching transactions: ${getErrorMessage(err)}`);
    cursor = lastCursor;
  }
  return { added, modified, removed, cursor, accessToken };
};

const updateTransactions = async (plaidItemId: string) => {
  // Fetch new transactions from plaid api.
  const { added, modified, removed, cursor, accessToken } =
    await fetchTransactionUpdates(plaidItemId);

  const {
    data: { accounts: accountsData },
  } = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  // Update the DB.
  await createOrUpdateAccounts(accountsData, plaidItemId);

  await createOrUpdateTransactions(added.concat(modified));
  // await deleteTransactions(removed);
  await updateItemTransactionsCursor(plaidItemId, cursor);
  return {
    addedCount: added.length,
    modifiedCount: modified.length,
    removedCount: removed.length,
  };
};

const retrieveAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = await Item.findOne({
    where: { userId: req.user?.id },
  });
  if (data && req.user) {
    req.user.plaid_access_token = data.accessToken;
    next();
  } else {
    res.status(400).json({ error: 'access token not found' });
  }
};

const retrieveAccessTokens = async (userId: number) => {
  const data = await Item.findAll({
    where: { userId },
  });
  if (data) {
    const tokens = data.map((i) => i.accessToken);
    return tokens;
  }
  return null;
};

router.post('/create_link_token', isAuthenticated, async (req, res) => {
  // if (!req.user) return res.status(401);
  try {
    const configs = {
      user: {
        client_user_id: `${req.user?.id}`,
      },
      client_name: 'Perfi',
      products: config.PLAID_PRODUCTS,
      country_codes: config.PLAID_COUNTRY_CODES,
      language: 'en',
    };

    const createTokenres = await plaidClient.linkTokenCreate(configs);
    res.json(createTokenres.data);
  } catch (err) {
    console.log(err);
  }
});

router.post('/set_access_token', isAuthenticated, async (req, res) => {
  if (!req.user) return;
  const PUBLIC_TOKEN = req.body.public_token;
  const { data: exchangeData } = await plaidClient.itemPublicTokenExchange({
    public_token: PUBLIC_TOKEN,
  });

  const {
    data: { item: itemData },
  } = await plaidClient.itemGet({
    access_token: exchangeData.access_token,
  });

  const configs = {
    institution_id: itemData.institution_id,
    country_codes: config.PLAID_COUNTRY_CODES,
    options: { include_optional_metadata: true },
  };
  const {
    data: { institution: institutionData },
    // @ts-ignore
  } = await plaidClient.institutionsGetById(configs);

  createOrUpdateInstitution(institutionData);
  const item = createOrUpdateItem(
    itemData,
    exchangeData.access_token,
    req.user.id,
  );

  const {
    data: { accounts: accountsData },
  } = await plaidClient.accountsGet({
    access_token: exchangeData.access_token,
  });

  createOrUpdateAccounts(accountsData, itemData.item_id);
  const { addedCount, modifiedCount, removedCount } = await updateTransactions(
    itemData.item_id,
  );
  console.log(
    `Added: ${addedCount}, modified: ${modifiedCount}, removed: ${removedCount}`,
  );

  res.json(item);
});

router.get('/accounts', isAuthenticated, async (req, res) => {
  if (!req.user) return;
  const tokens = await retrieveAccessTokens(req.user.id);
  // TODO: provide proper error
  if (!tokens) {
    res.status(404);
  } else {
    const accounts = await Promise.all(
      tokens.map(async (t) => {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: t,
        });
        // console.log(accountsResponse.data);
        const configs = {
          institution_id: accountsResponse.data.item.institution_id,
          country_codes: config.PLAID_COUNTRY_CODES,
          options: { include_optional_metadata: true },
        };
        // TODO: resolve ts-ignore
        // @ts-ignore
        const instResponse = await plaidClient.institutionsGetById(configs);
        // console.log(instResponse.data);
        const updAccount = accountsResponse.data.accounts.map(
          (acc: AccountBase) => ({
            ...acc,
            institution_name: instResponse.data.institution.name,
            institution_logo: instResponse.data.institution.logo,
            institution_color: instResponse.data.institution.primary_color,
          }),
        );

        return updAccount;
      }),
    );
    res.json(accounts.flat());
  }
});

router.get('/item', isAuthenticated, retrieveAccessToken, async (req, res) => {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  if (!req.user) return;
  const itemResponse = await plaidClient.itemGet({
    access_token: req.user.plaid_access_token,
  });

  // Also pull information about the institution
  const configs = {
    institution_id: itemResponse.data.item.institution_id,
    country_codes: config.PLAID_COUNTRY_CODES,
  };
  // @ts-ignore
  const instResponse = await plaidClient.institutionsGetById(configs);
  res.json({
    item: itemResponse.data.item,
    institution: instResponse.data.institution,
  });
});

router.get('/categories', async (_req, res) => {
  const response = await plaidClient.categoriesGet({});
  const { categories } = response.data;
  res.json(categories);
});

export default router;
