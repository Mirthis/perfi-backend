"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = __importDefault(require("sequelize"));
const middleware_1 = require("../utils/middleware");
const transaction_queries_1 = require("../models/transaction-queries");
const requestParamParser_1 = require("../utils/requestParamParser");
const calendar_1 = require("../models/calendar");
const router = express_1.default.Router();
const toExcludeTransactionReq = ({ transactionId, exclude, }) => {
    const requestParameters = {
        transactionId: (0, requestParamParser_1.parseNumber)(transactionId, 'transactionId'),
        exclude: (0, requestParamParser_1.parseBoolean)(exclude, 'exclude'),
    };
    return requestParameters;
};
const toSetTransactionCategoryReq = ({ transactionId, categoryId, }) => {
    const requestParameters = {
        transactionId: (0, requestParamParser_1.parseNumber)(transactionId, 'transactionId'),
        categoryId: (0, requestParamParser_1.parseNumber)(categoryId, 'categoryId'),
    };
    return requestParameters;
};
const toSpendingByOptions = ({ accountIds, startDate, refDate, endDate, categoryIds, removeZeroCounts, }) => {
    const requestParams = {};
    if (accountIds !== undefined) {
        requestParams.accountIds = (0, requestParamParser_1.parseNumbersArray)(accountIds, 'accountIds');
    }
    if (startDate !== undefined) {
        requestParams.startDate = new Date((0, requestParamParser_1.parseDate)(startDate, 'startDate'));
    }
    if (endDate !== undefined) {
        requestParams.endDate = new Date((0, requestParamParser_1.parseDate)(endDate, 'endDate'));
    }
    if (refDate !== undefined) {
        requestParams.refDate = new Date((0, requestParamParser_1.parseDate)(refDate, 'refMonth'));
    }
    if (categoryIds !== undefined) {
        requestParams.categoryIds = (0, requestParamParser_1.parseNumbersArray)(categoryIds, 'categoryIds');
    }
    if (removeZeroCounts !== undefined) {
        requestParams.removeZeroCounts = Boolean(removeZeroCounts);
    }
    return requestParams;
};
// TODO: add proper parsing of input parameters for this and other requests
router.get('/', middleware_1.isAuthenticated, async (req, res) => {
    // TODO: remove check anduse Typescript |
    if (!req.user)
        throw Error('Unauthorized');
    const queryOptions = { ...req.query };
    if (req.query.accountIds &&
        (typeof req.query.accountIds === 'string' ||
            req.query.accountIds instanceof String)) {
        queryOptions.accountIds = req.query.accountIds
            .split(',')
            .map((i) => Number(i));
    }
    if (req.query.categoryIds &&
        (typeof req.query.categoryIds === 'string' ||
            req.query.categoryIds instanceof String)) {
        queryOptions.categoryIds = req.query.categoryIds
            .split(',')
            .map((i) => Number(i));
    }
    const transactions = await (0, transaction_queries_1.getTransactions)(req.user.id, queryOptions);
    res.json(transactions);
});
router.post('/exclude/', middleware_1.isAuthenticated, async (req, res) => {
    const { transactionId, exclude } = toExcludeTransactionReq(req.body);
    const transaction = await (0, transaction_queries_1.setTransactionExcludeFlag)(req.user.id, transactionId, exclude);
    if (!transaction) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(transaction);
    }
});
router.post('/category/', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);
    const transaction = await (0, transaction_queries_1.setTransactionCategory)(req.user.id, transactionId, categoryId);
    if (!transaction) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(transaction);
    }
});
router.get('/similar_count', async (req, res) => {
    if (!req.query.transactionId) {
        throw Error('Invalid parameter transactionId');
    }
    const txCount = await (0, transaction_queries_1.getSimilarTransactionsCount)(req.user.id, Number(req.query.transactionId));
    if (!txCount) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(txCount[0]);
    }
});
router.get('/find_similar', async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    if (!req.query.transactionId) {
        throw Error('Invalid parameter transactionId');
    }
    const transactions = await (0, transaction_queries_1.getSimilarTransactions)(req.user.id, Number(req.query.transactionId));
    if (!transactions) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(transactions);
    }
});
router.put('/update_category', async (req, res) => {
    const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);
    const transaction = await (0, transaction_queries_1.setTransactionCategory)(req.user.id, transactionId, categoryId);
    if (!transaction) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(transaction);
    }
});
router.put('/update_category_similar', async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);
    const affected = await (0, transaction_queries_1.setSimilarTransactionsCategory)(req.user.id, transactionId, categoryId);
    if (!affected) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(affected);
    }
});
router.get('/id/:transactionId', middleware_1.isAuthenticated, async (req, res) => {
    const transaction = await (0, transaction_queries_1.getTransaction)(req.user.id, Number(req.params.transactionId));
    if (!transaction) {
        res.status(400).json('transaction not found');
    }
    else {
        res.json(transaction);
    }
});
router.get('/spending', middleware_1.isAuthenticated, async (req, res) => {
    const queryParams = toSpendingByOptions(req.query);
    queryParams.aggregateBy = ['calendar.year', 'calendar.month'];
    const transactions = await (0, transaction_queries_1.getSpending)(req.user.id, queryParams);
    res.json(transactions);
});
router.get('/spending/bycategory/', middleware_1.isAuthenticated, async (req, res) => {
    const queryParams = toSpendingByOptions(req.query);
    queryParams.aggregateBy = [
        'calendar.year',
        'calendar.month',
        'category.id',
        'category.name',
        'category.iconName',
        'category.iconColor',
        'category.exclude',
    ];
    const spending = await (0, transaction_queries_1.getSpending)(req.user.id, queryParams);
    res.json(spending);
});
router.get('/spending/byaccount/', middleware_1.isAuthenticated, async (req, res) => {
    const queryParams = toSpendingByOptions(req.query);
    queryParams.aggregateBy = [
        'calendar.year',
        'calendar.month',
        'account.id',
        'account.name',
        'account.officialName',
        'account.type',
        'account.subType',
        'account.currentBalance',
        'account.availableBalance',
        'account.isoCurrencyCode',
        [sequelize_1.default.col('account->item->institution.name'), 'institutionName'],
        [sequelize_1.default.col('account->item->institution.color'), 'institutionColor'],
        [sequelize_1.default.col('account->item->institution.logo'), 'institutionLogo'],
    ];
    // @ts-ignore
    const accounts = (await (0, transaction_queries_1.getSpending)(req.user.id, queryParams));
    const cleansedAccount = accounts.map((i) => ({
        ...i,
        institutionLogo: i.institutionLogo.toString('base64'),
    }));
    res.json(cleansedAccount);
});
router.get('/spending/compare/bycategory', middleware_1.isAuthenticated, async (req, res) => {
    const refDate = (0, requestParamParser_1.parseDate)(req.query.refDate, 'refDate');
    const dates = await (0, calendar_1.getDates)(new Date(refDate));
    if (!dates) {
        throw Error('Something went wrong');
    }
    const options = {
        aggregateBy: [
            'calendar.year',
            'calendar.month',
            'category.id',
            'category.name',
            'category.iconName',
            'category.iconColor',
            'category.exclude',
        ],
        removeZeroCounts: true,
    };
    options.startDate = dates.curr_month_start_date;
    options.endDate = dates.curr_month_end_date;
    const cmValues = await (0, transaction_queries_1.getSpending)(req.user.id, options);
    options.startDate = dates.prev_month_start_date;
    options.endDate = dates.prev_month_end_date;
    const pmValues = await (0, transaction_queries_1.getSpending)(req.user.id, options);
    res.json({ cmValues, pmValues });
});
router.get('/spending/compare/cumulative', middleware_1.isAuthenticated, async (req, res) => {
    const refDate = (0, requestParamParser_1.parseDate)(req.query.refDate, 'refDate');
    const dates = await (0, calendar_1.getDates)(new Date(refDate));
    if (!dates) {
        throw Error('Something went wrong');
    }
    const options = {
        startDate: dates.curr_month_start_date,
        endDate: dates.curr_month_end_date,
    };
    const cmValues = await (0, transaction_queries_1.getCumulativeSpending)(req.user.id, options);
    options.startDate = dates.prev_month_start_date;
    options.endDate = dates.prev_month_end_date;
    const pmValues = await (0, transaction_queries_1.getCumulativeSpending)(req.user.id, options);
    options.startDate = dates.prev_12_month_start_date;
    options.endDate = dates.prev_12_month_end_date;
    const p12Values = await (0, transaction_queries_1.getCumulativeSpending)(req.user.id, options);
    res.json({ cmValues, pmValues, p12Values });
});
router.get('/dates', async (req, res) => {
    const dates = await (0, transaction_queries_1.getMinMaxDate)(req.user.id);
    return res.json(dates);
});
exports.default = router;
