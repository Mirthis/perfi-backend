"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plaid_1 = require("plaid");
const express_1 = __importDefault(require("express"));
const models_1 = require("../models");
const auth_1 = require("../utils/auth");
const config_1 = __importDefault(require("../utils/config"));
const institution_1 = require("../models/institution");
const item_1 = require("../models/item");
const transaction_queries_1 = require("../models/transaction-queries");
const account_queries_1 = require("../models/account-queries");
const logger_1 = require("../utils/logger");
const errors_1 = require("../types/errors");
const types_1 = require("../types/types");
const institutions_queries_1 = require("../models/institutions-queries");
const router = express_1.default.Router();
const configuration = new plaid_1.Configuration({
    basePath: plaid_1.PlaidEnvironments[config_1.default.PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': config_1.default.PLAID_CLIENT_ID,
            'PLAID-SECRET': config_1.default.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});
const plaidClient = new plaid_1.PlaidApi(configuration);
const fetchTransactionUpdates = async (plaidItemId) => {
    const { accessToken, transactionCursor: lastCursor } = (await (0, item_1.getItemByPlaidItemId)(plaidItemId));
    let cursor = lastCursor;
    let added = [];
    let modified = [];
    let removed = [];
    let hasMore = true;
    const batchSize = 100;
    try {
        /* eslint-disable no-await-in-loop */
        while (hasMore) {
            const requestParams = {
                access_token: accessToken,
                cursor: cursor || undefined,
                count: batchSize,
                options: {
                    include_original_description: true,
                    include_personal_finance_category: true,
                },
            };
            // const requestOptions = {
            //   include_original_description: true,
            //   include_personal_finance_category: true,
            // };
            const { data } = await plaidClient.transactionsSync(requestParams);
            // Add this page of results
            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            hasMore = data.has_more;
            // Update cursor to the next cursor
            cursor = data.next_cursor;
        }
    }
    catch (err) {
        console.error(`Error fetching transactions: ${(0, logger_1.getErrorMessage)(err)}`);
        cursor = lastCursor;
    }
    return { added, modified, removed, cursor, accessToken };
};
const updateTransactions = async (plaidItemId) => {
    // Fetch new transactions from plaid api.
    const { added, modified, removed, cursor, accessToken } = await fetchTransactionUpdates(plaidItemId);
    // TODO: need to consider account get balance
    const { data: { accounts: accountsData }, } = await plaidClient.accountsGet({
        access_token: accessToken,
    });
    // Update the DB.
    await (0, account_queries_1.createOrUpdateAccounts)(accountsData, plaidItemId);
    await (0, transaction_queries_1.createOrUpdateTransactions)(added.concat(modified));
    // TODO: await deleteTransactions(removed);
    await (0, item_1.updateItemTransactionsCursor)(plaidItemId, cursor);
    return {
        addedCount: added.length,
        modifiedCount: modified.length,
        removedCount: removed.length,
    };
};
const retrieveAccessTokens = async (userId) => {
    const data = await models_1.Item.findAll({
        where: { userId },
    });
    if (data) {
        const tokens = data.map((i) => i.accessToken);
        return tokens;
    }
    return null;
};
router.post('/create_link_token', auth_1.isAuthenticated, async (req, res) => {
    // if (!req.user) return res.status(401);
    const configs = {
        user: {
            client_user_id: `${req.user?.id}`,
        },
        client_name: 'Perfi',
        country_codes: config_1.default.PLAID_COUNTRY_CODES,
        language: 'en',
    };
    if (req.body.itemId) {
        const item = await (0, item_1.getItem)(req.user.id, req.body.itemId);
        if (item) {
            configs.access_token = item.accessToken;
            configs.update = { account_selection_enabled: true };
            // configs.link_customization_name = 'account_selection_v2_customization';
        }
    }
    else {
        configs.products = config_1.default.PLAID_PRODUCTS;
    }
    try {
        const createTokenres = await plaidClient.linkTokenCreate(configs);
        res.json(createTokenres.data);
    }
    catch (err) {
        console.log(err);
    }
});
router.post('/set_access_token', auth_1.isAuthenticated, async (req, res) => {
    if (req.body.public_token)
        return;
    if (await (0, institutions_queries_1.isExistingInstitution)(req.user.id, req.body.metadata.institution.institution_id)) {
        throw new errors_1.PlaidError(`Institution ${req.body.metadata.institution.name} already exist for the user`, types_1.PlaidErrorName.DUPLICATE_INSTITUTION);
    }
    const PUBLIC_TOKEN = req.body.publicToken;
    const { data: exchangeData } = await plaidClient.itemPublicTokenExchange({
        public_token: PUBLIC_TOKEN,
    });
    const { access_token: accessToken } = exchangeData;
    // get item accessible via the token
    const { data: { item: itemData }, } = await plaidClient.itemGet({
        access_token: accessToken,
    });
    // INSTITUTION CREATION  //
    const configs = {
        institution_id: itemData.institution_id,
        country_codes: config_1.default.PLAID_COUNTRY_CODES,
        options: { include_optional_metadata: true },
    };
    // get institutions for the item
    const { data: { institution: institutionData },
    // @ts-ignore
     } = await plaidClient.institutionsGetById(configs);
    // create or update institutions data
    await (0, institution_1.createOrUpdateInstitution)(institutionData);
    // ITEM CREATION  //
    const item = await (0, item_1.createOrUpdateItem)(itemData, accessToken, req.user.id);
    // ACCOUNT CREATION  //
    // get accounts accessible by the token
    const { data: { accounts: accountsData }, } = await plaidClient.accountsGet({
        access_token: exchangeData.access_token,
    });
    // create or update account
    (0, account_queries_1.createOrUpdateAccounts)(accountsData, itemData.item_id);
    // TRANSACTIONS CREATION  //
    const { addedCount, modifiedCount, removedCount } = await updateTransactions(itemData.item_id);
    console.log(`Added: ${addedCount}, modified: ${modifiedCount}, removed: ${removedCount}`);
    res.json(item);
});
router.post('/update_item_access', auth_1.isAuthenticated, async (req, res) => {
    const institution = await (0, institutions_queries_1.getInstitutionByPlaidId)(req.user.id, req.body.metadata.institution.institution_id);
    if (!institution)
        throw Error('Item for existing institution not found');
    const { accessToken, plaidItemId } = institution.items[0];
    if (!accessToken || !plaidItemId)
        throw Error('Item for existing institution not found');
    // get item accessible via the token
    const { data: { item: itemData }, } = await plaidClient.itemGet({
        access_token: accessToken,
    });
    // console.log('itemData');
    // console.log(itemData);
    // // INSTITUTION CREATION  //
    // const configs = {
    //   institution_id: itemData.institution_id,
    //   country_codes: config.PLAID_COUNTRY_CODES,
    //   options: { include_optional_metadata: true },
    // };
    // // get institutions for the item
    // const {
    //   data: { institution: institutionData },
    //   // @ts-ignore
    // } = await plaidClient.institutionsGetById(configs);
    // // create or update institutions data
    // await createOrUpdateInstitution(institutionData);
    // ITEM CREATION  //
    await (0, item_1.createOrUpdateItem)(itemData, accessToken, req.user.id);
    // ACCOUNT CREATION  //
    // get accounts accessible by the token
    const { data: { accounts: accountsData }, } = await plaidClient.accountsGet({
        access_token: accessToken,
    });
    const existingAccounts = await (0, account_queries_1.getAccounts)(req.user.id, institution.id);
    const accountsIds = accountsData.map((acc) => acc.account_id);
    const accountsToDelete = existingAccounts.filter((acc) => !accountsIds.includes(acc.plaidAccountId));
    // delete account no longer required
    accountsToDelete.forEach(async (acc) => {
        await (0, account_queries_1.deleteAccount)(acc.id);
    });
    // create or update account
    (0, account_queries_1.createOrUpdateAccounts)(accountsData, plaidItemId);
    // TRANSACTIONS CREATION  //
    const { addedCount, modifiedCount, removedCount } = await updateTransactions(plaidItemId);
    console.log(`Added: ${addedCount}, modified: ${modifiedCount}, removed: ${removedCount}`);
    res.json(1);
});
router.get('/accounts', auth_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        return;
    const tokens = await retrieveAccessTokens(req.user.id);
    // TODO: provide proper error
    if (!tokens) {
        res.status(404);
    }
    else {
        const accounts = await Promise.all(tokens.map(async (t) => {
            const accountsResponse = await plaidClient.accountsGet({
                access_token: t,
            });
            // console.log(accountsResponse.data);
            const configs = {
                institution_id: accountsResponse.data.item.institution_id,
                country_codes: config_1.default.PLAID_COUNTRY_CODES,
                options: { include_optional_metadata: true },
            };
            // TODO: resolve ts-ignore
            // @ts-ignore
            const instResponse = await plaidClient.institutionsGetById(configs);
            // console.log(instResponse.data);
            const updAccount = accountsResponse.data.accounts.map((acc) => ({
                ...acc,
                institution_name: instResponse.data.institution.name,
                institution_logo: instResponse.data.institution.logo,
                institution_color: instResponse.data.institution.primary_color,
            }));
            return updAccount;
        }));
        res.json(accounts.flat());
    }
});
router.get('/item', auth_1.isAuthenticated, async (req, res) => {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    const data = await models_1.Item.findOne({
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
        country_codes: config_1.default.PLAID_COUNTRY_CODES,
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
router.post('/sync_transactions', auth_1.isAuthenticated, async (req, res) => {
    const { itemId } = req.body;
    const item = await (0, item_1.getItem)(req.user.id, itemId);
    if (!item) {
        throw new Error('Item not found');
    }
    const stats = await updateTransactions(item.plaidItemId);
    res.json(stats);
});
exports.default = router;
