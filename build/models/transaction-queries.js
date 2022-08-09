"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpending = exports.getCumulativeSpending = exports.setSimilarTransactionsCategory = exports.getSimilarTransactionsCount = exports.setTransactionCategory = exports.setTransactionExcludeFlag = exports.getTopMerchants = exports.getTransactionsSummary = exports.createOrUpdateTransactions = exports.getSimilarTransactions = exports.getSimilarTransactionsByName = exports.getTransactions = exports.getTransaction = void 0;
const sequelize_1 = require("sequelize");
const account_1 = __importDefault(require("./account"));
const account_queries_1 = require("./account-queries");
const item_1 = __importDefault(require("./item"));
const transaction_1 = __importDefault(require("./transaction"));
const db_1 = require("../utils/db");
const plaidCategory_1 = __importStar(require("./plaidCategory"));
const category_1 = __importDefault(require("./category"));
const types_1 = require("../types/types");
const calendar_1 = __importDefault(require("./calendar"));
const institution_1 = __importDefault(require("./institution"));
const category_queries_1 = require("./category-queries");
const getTransaction = async (userId, transactionId) => {
    const transaction = await transaction_1.default.findOne({
        attributes: {
            exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
        },
        include: [
            {
                model: account_1.default,
                include: [
                    {
                        model: item_1.default,
                        where: { userId },
                        attributes: ['id'],
                        include: [
                            { model: institution_1.default, attributes: ['name', 'color', 'logo'] },
                        ],
                    },
                ],
                attributes: ['id', 'name'],
            },
            {
                model: category_1.default,
                attributes: ['id', 'name', 'iconName', 'iconColor', 'exclude'],
            },
            {
                model: plaidCategory_1.default,
                attributes: ['id', 'name_lvl1', 'name_lvl2', 'name_lvl3'],
            },
        ],
        where: { id: transactionId },
    });
    return transaction;
};
exports.getTransaction = getTransaction;
const getTransactions = async (userId, options) => {
    const where = {};
    const accountWhere = {};
    const categoryWhere = {};
    const refDate = options?.refDate;
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    const offset = options?.offset || 0;
    const limit = options?.limit || 30;
    const accountIds = options?.accountIds;
    const categoryIds = options?.categoryIds;
    const order = options?.orderBy
        ? [
            [options?.orderBy, 'DESC'],
            ['id', 'DESC'],
        ]
        : [
            ['calendarId', 'DESC'],
            ['id', 'DESC'],
        ];
    const excludedTransactionsFilter = options?.excludedTransactions;
    const onlyPositiveAmounts = options?.onlyPositiveAmounts !== undefined
        ? options.onlyPositiveAmounts
        : false;
    switch (Number(excludedTransactionsFilter)) {
        case types_1.ExcludedTransactionsFilter.ALL:
            break;
        case types_1.ExcludedTransactionsFilter.ONLY_EXCLUDED:
            Object.assign(where, {
                [sequelize_1.Op.or]: { exclude: true, '$category.exclude$': true },
            });
            break;
        case types_1.ExcludedTransactionsFilter.ONLY_INCLUDED:
            Object.assign(where, {
                [sequelize_1.Op.and]: { exclude: false, '$category.exclude$': false },
            });
            break;
        default:
            Object.assign(where, {
                [sequelize_1.Op.and]: { exclude: false, '$category.exclude$': false },
            });
            // categoryWhere.exclude = false;
            break;
    }
    if (onlyPositiveAmounts) {
        where.amount = { [sequelize_1.Op.gt]: 0 };
    }
    if (refDate) {
        const dates = await calendar_1.default.findOne({
            where: { calendar_date: refDate },
        });
        where['$calendar.calendar_date$'] = {
            [sequelize_1.Op.between]: [dates?.curr_month_start_date, dates?.curr_month_end_date],
        };
    }
    else if (startDate && endDate) {
        where.txDate = { [sequelize_1.Op.between]: [startDate, endDate] };
    }
    else if (startDate) {
        where.txDate = { [sequelize_1.Op.gte]: startDate };
    }
    else if (endDate) {
        where.txDate = { [sequelize_1.Op.lte]: endDate };
    }
    if (accountIds) {
        accountWhere.id = { [sequelize_1.Op.in]: accountIds };
    }
    if (categoryIds) {
        categoryWhere.id = { [sequelize_1.Op.in]: categoryIds };
    }
    const transactions = await transaction_1.default.findAndCountAll({
        attributes: {
            exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
        },
        include: [
            {
                model: account_1.default,
                where: accountWhere,
                include: [
                    {
                        model: item_1.default,
                        where: { userId },
                        attributes: ['id'],
                        include: [
                            { model: institution_1.default, attributes: ['name', 'color', 'logo'] },
                        ],
                    },
                ],
                attributes: ['id', 'name'],
            },
            {
                model: category_1.default,
                where: categoryWhere,
                attributes: ['id', 'name', 'iconName', 'iconColor', 'exclude'],
            },
            {
                model: plaidCategory_1.default,
                attributes: ['id', 'name_lvl1', 'name_lvl2', 'name_lvl3'],
            },
        ],
        where,
        order,
        offset,
        limit,
    });
    return transactions;
};
exports.getTransactions = getTransactions;
const getSimilarTransactionsByName = async (userId, name, merchantName, limit) => {
    const where = {};
    if (merchantName && name) {
        Object.assign(where, {
            [sequelize_1.Op.or]: { merchantName, name },
        });
    }
    else if (merchantName) {
        where.merchantName = merchantName;
    }
    else if (name) {
        where.name = name;
    }
    const transactions = await transaction_1.default.findAll({
        attributes: {
            exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
        },
        include: [
            {
                model: account_1.default,
                include: [
                    {
                        model: item_1.default,
                        where: { userId },
                        attributes: ['id'],
                        include: [
                            { model: institution_1.default, attributes: ['name', 'color', 'logo'] },
                        ],
                    },
                ],
                attributes: ['id', 'name'],
            },
            {
                model: category_1.default,
                attributes: ['id', 'name', 'iconName', 'iconColor'],
            },
            {
                model: plaidCategory_1.default,
                attributes: ['id', 'name_lvl1', 'name_lvl2', 'name_lvl3'],
            },
        ],
        where,
        order: [['calendarId', 'DESC']],
        limit,
    });
    return transactions;
};
exports.getSimilarTransactionsByName = getSimilarTransactionsByName;
const getSimilarTransactions = async (userId, transactionId, limit) => {
    const transaction = await (0, exports.getTransaction)(userId, transactionId);
    if (!transaction) {
        return null;
    }
    const similarTransactions = await (0, exports.getSimilarTransactionsByName)(userId, transaction.name, transaction.merchantName, limit);
    return similarTransactions;
};
exports.getSimilarTransactions = getSimilarTransactions;
const createOrUpdateTransactions = async (transactions) => {
    // store accountsId retrieved from the database to avoid querying for the same accounts
    const accountIdMapping = new Map();
    // store category ids retrieved from the database to avoid querying for the same accounts
    const categoryIdMapping = new Map();
    const pendingQueries = transactions.map(async (transaction) => {
        const plaidAccountId = transaction.account_id;
        let account = accountIdMapping.get(plaidAccountId);
        if (!account) {
            const dbAccount = await (0, account_queries_1.getAccountByPlaidAccountId)(plaidAccountId);
            account = dbAccount;
            accountIdMapping.set(plaidAccountId, account);
        }
        const accountId = account.id;
        let categoryIds;
        const latestSimilarTx = await (0, exports.getSimilarTransactionsByName)(account.item.id, transaction.name, transaction.merchant_name, 1);
        if (latestSimilarTx.length > 0) {
            categoryIds = {
                categoryId: latestSimilarTx[0].category.id,
                plaidCategoryId: latestSimilarTx[0].plaidCategory.id,
            };
        }
        else {
            // TODO: This logic doesn't work as mapping update is within async functions and status is not shared across
            const categoryCode = transaction.category_id || '0';
            categoryIds = categoryIdMapping.get(categoryCode);
            if (!categoryIds) {
                const plaidCategory = await (0, plaidCategory_1.getPlaidCategoryByCode)(categoryCode);
                categoryIds = {
                    categoryId: plaidCategory.categoryId,
                    plaidCategoryId: plaidCategory.id,
                };
                categoryIdMapping.set(categoryCode, categoryIds);
            }
        }
        const txDate = new Date(transaction.date);
        const calendarId = txDate.getFullYear() * 10000 +
            (txDate.getMonth() + 1) * 100 +
            txDate.getDate();
        // if (!categoryIds) {
        //   categoryIds = { categoryId: -1, plaidCategoryId: -1 };
        // }
        const transValues = {
            plaidTransactionId: transaction.transaction_id,
            accountId,
            name: transaction.name,
            amount: transaction.amount,
            calendarId,
            txDate,
            txDatetime: transaction.datetime
                ? new Date(transaction.datetime)
                : new Date(transaction.date),
            pending: transaction.pending,
            plaidCategoryId: categoryIds?.plaidCategoryId,
            categoryId: categoryIds?.categoryId,
            ogCategoryId: categoryIds?.categoryId,
            paymentChannel: transaction.payment_channel,
            address: transaction.location.address,
            city: transaction.location.city,
            country: transaction.location.country,
            isoCurrencyCode: transaction.iso_currency_code,
            unofficialCurrencyCode: transaction.unofficial_currency_code,
            merchantName: transaction.merchant_name,
            exclude: false,
            personal_finance_primary: transaction.personal_finance_category?.primary,
            personal_finance_detailed: transaction.personal_finance_category?.detailed,
        };
        transaction_1.default.create(transValues);
    });
    await Promise.all(pendingQueries);
};
exports.createOrUpdateTransactions = createOrUpdateTransactions;
const getTransactionsSummary = async (userId, options) => {
    const where = {};
    const accountWhere = {};
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    const accountIds = options?.accountIds;
    if (startDate && endDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.between]: [startDate, endDate] };
    }
    else if (startDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.gte]: startDate };
    }
    else if (endDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.lte]: endDate };
    }
    where['$account->item.userId$'] = userId;
    if (accountIds) {
        accountWhere.id = { [sequelize_1.Op.in]: accountIds };
    }
    const having = options?.removeZeroCounts
        ? db_1.sequelize.where(db_1.sequelize.fn('count', db_1.sequelize.col('transaction.id')), {
            [sequelize_1.Op.gt]: 0,
        })
        : {};
    const transactionsSummary = await transaction_1.default.findAll({
        attributes: [
            'calendar.year',
            'calendar.month',
            [
                db_1.sequelize.fn('coalesce', db_1.sequelize.fn('sum', db_1.sequelize.col('amount')), '0'),
                'txAmount',
            ],
            [db_1.sequelize.fn('count', db_1.sequelize.col('transaction.id')), 'txCount'],
        ],
        where,
        include: [
            {
                model: calendar_1.default,
                attributes: [],
                required: false,
                right: true,
            },
            {
                model: account_1.default,
                where: accountWhere,
                required: false,
                include: [
                    {
                        model: item_1.default,
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: [],
            },
        ],
        group: ['calendar.year', 'calendar.month'],
        order: [
            [db_1.sequelize.col('calendar.year'), 'ASC'],
            [db_1.sequelize.col('calendar.month'), 'ASC'],
        ],
        having,
        raw: true,
    });
    return transactionsSummary;
};
exports.getTransactionsSummary = getTransactionsSummary;
const getTopMerchants = async (userId, options) => {
    const where = {};
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    if (startDate && endDate) {
        where.txDate = { [sequelize_1.Op.between]: [startDate, endDate] };
    }
    else if (startDate) {
        where.txDate = { [sequelize_1.Op.gte]: startDate };
    }
    else if (endDate) {
        where.txDate = { [sequelize_1.Op.lte]: endDate };
    }
    // TODO: Move default value to config
    const limit = options?.limit || 5;
    const topMerchants = await transaction_1.default.findAll({
        attributes: [
            [
                db_1.sequelize.fn('coalesce', db_1.sequelize.col('merchantName'), db_1.sequelize.col('transaction.name')),
                'name',
            ],
            [db_1.sequelize.fn('sum', db_1.sequelize.col('amount')), 'txAmount'],
            [db_1.sequelize.fn('count', db_1.sequelize.col('transaction.id')), 'txCount'],
        ],
        where,
        include: [
            {
                model: account_1.default,
                required: false,
                include: [
                    {
                        model: item_1.default,
                        required: false,
                        where: { userId },
                        attributes: [],
                    },
                ],
                attributes: [],
            },
        ],
        group: [
            db_1.sequelize.fn('coalesce', db_1.sequelize.col('merchantName'), db_1.sequelize.col('transaction.name')),
        ],
        order: [[db_1.sequelize.literal('"txAmount"'), 'DESC']],
        limit,
    });
    return topMerchants;
};
exports.getTopMerchants = getTopMerchants;
const setTransactionExcludeFlag = async (userId, transactionId, exclude) => {
    const transaction = await (0, exports.getTransaction)(userId, transactionId);
    if (!transaction) {
        return null;
    }
    transaction.exclude = exclude;
    await transaction.save();
    return transaction;
};
exports.setTransactionExcludeFlag = setTransactionExcludeFlag;
const setTransactionCategory = async (userId, transactionId, categoryId) => {
    const transaction = await (0, exports.getTransaction)(userId, transactionId);
    if (!transaction) {
        return null;
    }
    const category = await (0, category_queries_1.getCategory)(categoryId);
    if (!transaction ||
        !category ||
        (category.userId !== userId && category.userId !== -1)) {
        return null;
    }
    transaction.categoryId = categoryId;
    await transaction.save();
    await transaction.reload();
    return transaction;
};
exports.setTransactionCategory = setTransactionCategory;
const getSimilarTransactionsCount = async (userId, transactionId) => {
    const transaction = await (0, exports.getTransaction)(userId, transactionId);
    if (!transaction) {
        return null;
    }
    const { name, merchantName } = transaction;
    const where = {};
    if (merchantName && name) {
        Object.assign(where, {
            [sequelize_1.Op.or]: { merchantName, name },
        });
    }
    else if (merchantName) {
        where.merchantName = merchantName;
    }
    else if (name) {
        where.name = name;
    }
    const txCount = await transaction_1.default.findAll({
        attributes: [
            [db_1.sequelize.fn('count', db_1.sequelize.col('transaction.id')), 'txCount'],
        ],
        include: [
            {
                model: account_1.default,
                include: [
                    {
                        model: item_1.default,
                        where: { userId },
                        attributes: [],
                    },
                ],
                attributes: [],
            },
        ],
        where,
        raw: true,
    });
    return txCount;
};
exports.getSimilarTransactionsCount = getSimilarTransactionsCount;
const setSimilarTransactionsCategory = async (userId, transactionId, categoryId) => {
    const transaction = await (0, exports.getTransaction)(userId, transactionId);
    const category = await (0, category_queries_1.getCategory)(categoryId);
    if (!transaction ||
        !category ||
        (category.userId !== userId && category.userId !== -1)) {
        return null;
    }
    const { name, merchantName } = transaction;
    const where = {};
    if (merchantName && name) {
        Object.assign(where, {
            [sequelize_1.Op.or]: { merchantName, name },
        });
    }
    else if (merchantName) {
        where.merchantName = merchantName;
    }
    else if (name) {
        where.name = name;
    }
    const updTransactions = await transaction_1.default.update({ categoryId }, { where });
    return updTransactions;
};
exports.setSimilarTransactionsCategory = setSimilarTransactionsCategory;
const getCumulativeSpending = async (userId, options) => {
    // const queryDateFormatter = new Intl.DateTimeFormat('sv-SE', {
    //   year: 'numeric',
    //   month: '2-digit',
    //   day: '2-digit',
    // });
    // const startDate = queryDateFormatter.format(options.startDate);
    // const endDate = queryDateFormatter.format(options.endDate);
    const { startDate, endDate } = options;
    const spending = db_1.sequelize.query(`SELECT i.day, SUM(i.amount) OVER(ORDER BY i.day) "txAmount"
  FROM (
  SELECT cal.day,
    sum(CASE WHEN tx.exclude = true OR cat.exclude=true THEN 0 ELSE tx.amount END) amount
  FROM transactions tx
  INNER JOIN categories cat
  ON tx."categoryId" = cat.id
  INNER JOIN accounts acc
  ON tx."accountId" = acc.id
  INNER JOIN items it
  ON acc."itemId" = it.id AND it."userId" = ${userId}
  RIGHT OUTER JOIN calendar cal
  ON tx."calendarId" = cal.id
  WHERE cal.calendar_date BETWEEN '${startDate}' AND '${endDate}'
  GROUP BY cal.day
  ) i;
  `, { type: sequelize_1.QueryTypes.SELECT });
    return spending;
};
exports.getCumulativeSpending = getCumulativeSpending;
const getSpending = async (userId, options) => {
    const where = {};
    const accountWhere = {};
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    const refDate = options?.refDate;
    const accountIds = options?.accountIds;
    const categoryIds = options?.categoryIds;
    const selectColumns = options?.aggregateBy || [];
    const aggregateBy = options?.aggregateBy?.map((e) => (Array.isArray(e) ? e[1] : e)) || [];
    if (refDate) {
        const dates = await calendar_1.default.findOne({
            where: { calendar_date: refDate },
        });
        where['$calendar.calendar_date$'] = {
            [sequelize_1.Op.between]: [dates?.curr_month_start_date, dates?.curr_month_end_date],
        };
    }
    if (startDate && endDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.between]: [startDate, endDate] };
    }
    else if (startDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.gte]: startDate };
    }
    else if (endDate) {
        where['$calendar.calendar_date$'] = { [sequelize_1.Op.lte]: endDate };
    }
    if (accountIds) {
        accountWhere.id = { [sequelize_1.Op.in]: accountIds };
    }
    if (categoryIds) {
        where['$category.id$'] = { [sequelize_1.Op.in]: categoryIds };
    }
    where['$account->item.userId$'] = userId;
    const having = options?.removeZeroCounts
        ? db_1.sequelize.where(db_1.sequelize.literal('COUNT(CASE WHEN transaction.exclude = true OR category.exclude=true THEN null ELSE transaction.id END)'), {
            [sequelize_1.Op.gt]: 0,
        })
        : {};
    const spendingSummary = await transaction_1.default.findAll({
        attributes: [
            ...selectColumns,
            [
                db_1.sequelize.literal('COALESCE(SUM(CASE WHEN transaction.exclude = true OR category.exclude=true THEN 0 ELSE amount END),0)'),
                'txAmount',
            ],
            [
                db_1.sequelize.literal('COUNT(CASE WHEN transaction.exclude = true OR category.exclude=true THEN null ELSE transaction.id END)'),
                'txCount',
            ],
        ],
        where,
        include: [
            {
                model: calendar_1.default,
                attributes: [],
                required: false,
                right: true,
            },
            {
                model: category_1.default,
                attributes: [],
                required: false,
                // required: false,
                // right: true,
                // on: {
                //   [Op.or]: [
                //     { id: { [Op.eq]: sequelize.col('categoryId') } },
                //     { '$transaction.id$': null },
                //   ],
                // },
            },
            {
                model: account_1.default,
                where: accountWhere,
                required: false,
                attributes: [],
                include: [
                    {
                        model: item_1.default,
                        required: false,
                        attributes: [],
                        include: [
                            {
                                model: institution_1.default,
                                required: false,
                                attributes: [],
                            },
                        ],
                    },
                ],
            },
        ],
        group: aggregateBy,
        having,
        raw: true,
    });
    return spendingSummary;
};
exports.getSpending = getSpending;
