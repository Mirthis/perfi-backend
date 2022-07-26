import {
  AccountBase,
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  RemovedTransaction,
  Transaction,
} from 'plaid';
import express from 'express';
import { Item } from '../models';
import { isAuthenticated } from '../utils/auth';
import config from '../utils/config';
import { createOrUpdateInstitution } from '../models/institution';
import {
  createOrUpdateItem,
  getItemByPlaidItemId,
  updateItemTransactionsCursor,
} from '../models/item';
import { createOrUpdateTransactions } from '../models/transaction-queries';
import { createOrUpdateAccounts } from '../models/account-queries';
import { getErrorMessage } from '../utils/logger';

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
  // TODO: await deleteTransactions(removed);
  await updateItemTransactionsCursor(plaidItemId, cursor);

  return {
    addedCount: added.length,
    modifiedCount: modified.length,
    removedCount: removed.length,
  };
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
  console.log('body');
  console.log(req.body);
  const PUBLIC_TOKEN = req.body.publicToken;
  const { data: exchangeData } = await plaidClient.itemPublicTokenExchange({
    public_token: PUBLIC_TOKEN,
  });

  const { access_token: accessToken } = exchangeData;

  // get item accessible via the token
  const {
    data: { item: itemData },
  } = await plaidClient.itemGet({
    access_token: accessToken,
  });

  // INSTITUTION CREATION  //
  const configs = {
    institution_id: itemData.institution_id,
    country_codes: config.PLAID_COUNTRY_CODES,
    options: { include_optional_metadata: true },
  };

  // get institutions for the item
  const {
    data: { institution: institutionData },
    // @ts-ignore
  } = await plaidClient.institutionsGetById(configs);

  // create or update institutions data
  await createOrUpdateInstitution(institutionData);

  // ITEM CREATION  //
  const item = await createOrUpdateItem(itemData, accessToken, req.user.id);

  // ACCOUNT CREATION  //
  // get accounts accessible by the token
  const {
    data: { accounts: accountsData },
  } = await plaidClient.accountsGet({
    access_token: exchangeData.access_token,
  });

  // create or update account
  createOrUpdateAccounts(accountsData, itemData.item_id);

  // TRANSACTIONS CREATION  //
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

router.get('/item', isAuthenticated, async (req, res) => {
  // Pull the Item - this includes information about available products,
  // billed products, webhook information, and more.
  const data = await Item.findOne({
    where: { userId: req.user?.id },
  });
  if (!data) {
    return res.status(404).json('Item not found');
  }
  const itemResponse = await plaidClient.itemGet({
    access_token: data.accessToken,
  });

  // Also pull information about the institution
  const configs = {
    institution_id: itemResponse.data.item.institution_id,
    country_codes: config.PLAID_COUNTRY_CODES,
  };
  // @ts-ignore
  const instResponse = await plaidClient.institutionsGetById(configs);
  return res.json({
    item: itemResponse.data.item,
    institution: instResponse.data.institution,
  });
});

router.get('/categories', async (_req, res) => {
  const response = await plaidClient.categoriesGet({});
  const { categories } = response.data;
  res.json(categories);
});

router.get('/update_transactions', async (req, res) => {
  const { plaidItemId } = req.body;
  const stats = await updateTransactions(plaidItemId);
  res.json(stats);
});

export default router;
