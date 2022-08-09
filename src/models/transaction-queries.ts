import { Transaction as PlaidTransaction } from 'plaid';
import { Op, Order, QueryTypes } from 'sequelize';
import Account from './account';
import { getAccountByPlaidAccountId } from './account-queries';
import Item from './item';
import Transaction from './transaction';
import { sequelize } from '../utils/db';
import PlaidCategory, { getPlaidCategoryByCode } from './plaidCategory';
import Category from './category';
import {
  AccountWhereClause,
  CategoryWhereClause,
  ExcludedTransactionsFilter,
  GetCumulativeSpendingOptions,
  GetSpendingByOptions,
  GetTopMerchantsOptions,
  GetTransactionsOptions,
  TransactionsWhereClause,
} from '../types/types';
import Calendar from './calendar';
import Institution from './institution';
import { getCategory } from './category-queries';

export const getTransaction = async (userId: number, transactionId: number) => {
  const transaction = await Transaction.findOne({
    attributes: {
      exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
    },
    include: [
      {
        model: Account,
        include: [
          {
            model: Item,
            where: { userId },
            attributes: ['id'],
            include: [
              { model: Institution, attributes: ['name', 'color', 'logo'] },
            ],
          },
        ],
        attributes: ['id', 'name'],
      },
      {
        model: Category,
        attributes: ['id', 'name', 'iconName', 'iconColor', 'exclude'],
      },
      {
        model: PlaidCategory,
        attributes: ['id', 'name_lvl1', 'name_lvl2', 'name_lvl3'],
      },
    ],
    where: { id: transactionId },
  });
  return transaction;
};

export const getTransactions = async (
  userId: number,
  options?: GetTransactionsOptions,
) => {
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};
  const categoryWhere: CategoryWhereClause = {};

  const refDate = options?.refDate;
  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;
  const accountIds = options?.accountIds;
  const categoryIds = options?.categoryIds;
  const order: Order = options?.orderBy
    ? [
        [options?.orderBy, 'DESC'],
        ['id', 'DESC'],
      ]
    : [
        ['calendarId', 'DESC'],
        ['id', 'DESC'],
      ];
  const excludedTransactionsFilter = options?.excludedTransactions;
  const onlyPositiveAmounts =
    options?.onlyPositiveAmounts !== undefined
      ? options.onlyPositiveAmounts
      : false;

  switch (Number(excludedTransactionsFilter)) {
    case ExcludedTransactionsFilter.ALL:
      break;
    case ExcludedTransactionsFilter.ONLY_EXCLUDED:
      Object.assign(where, {
        [Op.or]: { exclude: true, '$category.exclude$': true },
      });
      break;
    case ExcludedTransactionsFilter.ONLY_INCLUDED:
      Object.assign(where, {
        [Op.and]: { exclude: false, '$category.exclude$': false },
      });
      break;
    default:
      Object.assign(where, {
        [Op.and]: { exclude: false, '$category.exclude$': false },
      });
      // categoryWhere.exclude = false;
      break;
  }

  if (onlyPositiveAmounts) {
    where.amount = { [Op.gt]: 0 };
  }

  if (refDate) {
    const dates = await Calendar.findOne({
      where: { calendar_date: refDate },
    });
    where['$calendar.calendar_date$'] = {
      [Op.between]: [dates?.curr_month_start_date, dates?.curr_month_end_date],
    };
  } else if (startDate && endDate) {
    where.txDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.txDate = { [Op.gte]: startDate };
  } else if (endDate) {
    where.txDate = { [Op.lte]: endDate };
  }

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }
  if (categoryIds) {
    categoryWhere.id = { [Op.in]: categoryIds };
  }

  const transactions = await Transaction.findAndCountAll({
    attributes: {
      exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
    },
    include: [
      {
        model: Account,
        where: accountWhere,
        include: [
          {
            model: Item,
            where: { userId },
            attributes: ['id'],
            include: [
              { model: Institution, attributes: ['name', 'color', 'logo'] },
            ],
          },
        ],
        attributes: ['id', 'name'],
      },
      {
        model: Category,
        where: categoryWhere,
        attributes: ['id', 'name', 'iconName', 'iconColor', 'exclude'],
      },
      {
        model: PlaidCategory,
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

export const getSimilarTransactionsByName = async (
  userId: number,
  name: string,
  merchantName: string | null | undefined,
  limit?: number,
) => {
  const where: TransactionsWhereClause = {};
  if (merchantName && name) {
    Object.assign(where, {
      [Op.or]: { merchantName, name },
    });
  } else if (merchantName) {
    where.merchantName = merchantName;
  } else if (name) {
    where.name = name;
  }

  const transactions = await Transaction.findAll({
    attributes: {
      exclude: ['plaidCategoryId', 'categoryId', 'accountId'],
    },
    include: [
      {
        model: Account,
        include: [
          {
            model: Item,
            where: { userId },
            attributes: ['id'],
            include: [
              { model: Institution, attributes: ['name', 'color', 'logo'] },
            ],
          },
        ],
        attributes: ['id', 'name'],
      },
      {
        model: Category,
        attributes: ['id', 'name', 'iconName', 'iconColor'],
      },
      {
        model: PlaidCategory,
        attributes: ['id', 'name_lvl1', 'name_lvl2', 'name_lvl3'],
      },
    ],
    where,
    order: [['calendarId', 'DESC']],
    limit,
  });
  return transactions;
};

export const getSimilarTransactions = async (
  userId: number,
  transactionId: number,
  limit?: number,
) => {
  const transaction = await getTransaction(userId, transactionId);

  if (!transaction) {
    return null;
  }

  const similarTransactions = await getSimilarTransactionsByName(
    userId,
    transaction.name,
    transaction.merchantName,
    limit,
  );

  return similarTransactions;
};

export const createOrUpdateTransactions = async (
  transactions: PlaidTransaction[],
) => {
  // store accountsId retrieved from the database to avoid querying for the same accounts
  const accountIdMapping = new Map<string, Account>();
  // store category ids retrieved from the database to avoid querying for the same accounts
  const categoryIdMapping = new Map<
    string,
    { categoryId: number; plaidCategoryId: number }
  >();

  const pendingQueries = transactions.map(async (transaction) => {
    const plaidAccountId = transaction.account_id;
    let account = accountIdMapping.get(plaidAccountId);

    if (!account) {
      const dbAccount = await getAccountByPlaidAccountId(plaidAccountId);
      account = dbAccount;
      accountIdMapping.set(plaidAccountId, account);
    }
    const accountId = account.id;

    let categoryIds:
      | { categoryId: number; plaidCategoryId: number }
      | undefined;

    const latestSimilarTx = await getSimilarTransactionsByName(
      account.item.id,
      transaction.name,
      transaction.merchant_name,
      1,
    );

    if (latestSimilarTx.length > 0) {
      categoryIds = {
        categoryId: latestSimilarTx[0].category.id,
        plaidCategoryId: latestSimilarTx[0].plaidCategory.id,
      };
    } else {
      // TODO: This logic doesn't work as mapping update is within async functions and status is not shared across
      const categoryCode = transaction.category_id || '0';
      categoryIds = categoryIdMapping.get(categoryCode);
      if (!categoryIds) {
        const plaidCategory = await getPlaidCategoryByCode(categoryCode);
        categoryIds = {
          categoryId: plaidCategory.categoryId,
          plaidCategoryId: plaidCategory.id,
        };
        categoryIdMapping.set(categoryCode, categoryIds);
      }
    }
    const txDate = new Date(transaction.date);
    const calendarId =
      txDate.getFullYear() * 10000 +
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
      personal_finance_detailed:
        transaction.personal_finance_category?.detailed,
    };

    Transaction.create(transValues);
  });
  await Promise.all(pendingQueries);
};

export const getTransactionsSummary = async (
  userId: number,
  options?: GetSpendingByOptions,
) => {
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};
  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const accountIds = options?.accountIds;

  if (startDate && endDate) {
    where['$calendar.calendar_date$'] = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where['$calendar.calendar_date$'] = { [Op.gte]: startDate };
  } else if (endDate) {
    where['$calendar.calendar_date$'] = { [Op.lte]: endDate };
  }

  where['$account->item.userId$'] = userId;

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }
  const having = options?.removeZeroCounts
    ? sequelize.where(sequelize.fn('count', sequelize.col('transaction.id')), {
        [Op.gt]: 0,
      })
    : {};

  const transactionsSummary = await Transaction.findAll({
    attributes: [
      'calendar.year',
      'calendar.month',
      [
        sequelize.fn(
          'coalesce',
          sequelize.fn('sum', sequelize.col('amount')),
          '0',
        ),
        'txAmount',
      ],
      [sequelize.fn('count', sequelize.col('transaction.id')), 'txCount'],
    ],
    where,
    include: [
      {
        model: Calendar,
        attributes: [],
        required: false,
        right: true,
      },
      {
        model: Account,
        where: accountWhere,
        required: false,
        include: [
          {
            model: Item,
            required: false,
            attributes: [],
          },
        ],
        attributes: [],
      },
    ],
    group: ['calendar.year', 'calendar.month'],
    order: [
      [sequelize.col('calendar.year'), 'ASC'],
      [sequelize.col('calendar.month'), 'ASC'],
    ],
    having,
    raw: true,
  });

  return transactionsSummary;
};

export const getTopMerchants = async (
  userId: number,
  options: GetTopMerchantsOptions,
) => {
  const where: TransactionsWhereClause = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;

  if (startDate && endDate) {
    where.txDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.txDate = { [Op.gte]: startDate };
  } else if (endDate) {
    where.txDate = { [Op.lte]: endDate };
  }

  // TODO: Move default value to config
  const limit = options?.limit || 5;

  const topMerchants = await Transaction.findAll({
    attributes: [
      [
        sequelize.fn(
          'coalesce',
          sequelize.col('merchantName'),
          sequelize.col('transaction.name'),
        ),
        'name',
      ],
      [sequelize.fn('sum', sequelize.col('amount')), 'txAmount'],
      [sequelize.fn('count', sequelize.col('transaction.id')), 'txCount'],
    ],
    where,
    include: [
      {
        model: Account,
        required: false,
        include: [
          {
            model: Item,
            required: false,
            where: { userId },
            attributes: [],
          },
        ],
        attributes: [],
      },
    ],
    group: [
      sequelize.fn(
        'coalesce',
        sequelize.col('merchantName'),
        sequelize.col('transaction.name'),
      ),
    ],
    order: [[sequelize.literal('"txAmount"'), 'DESC']],
    limit,
  });

  return topMerchants;
};

export const setTransactionExcludeFlag = async (
  userId: number,
  transactionId: number,
  exclude: boolean,
) => {
  const transaction = await getTransaction(userId, transactionId);
  if (!transaction) {
    return null;
  }
  transaction.exclude = exclude;
  await transaction.save();
  return transaction;
};

export const setTransactionCategory = async (
  userId: number,
  transactionId: number,
  categoryId: number,
) => {
  const transaction = await getTransaction(userId, transactionId);
  if (!transaction) {
    return null;
  }
  const category = await getCategory(categoryId);
  if (
    !transaction ||
    !category ||
    (category.userId !== userId && category.userId !== -1)
  ) {
    return null;
  }

  transaction.categoryId = categoryId;
  await transaction.save();
  await transaction.reload();
  return transaction;
};

export const getSimilarTransactionsCount = async (
  userId: number,
  transactionId: number,
) => {
  const transaction = await getTransaction(userId, transactionId);

  if (!transaction) {
    return null;
  }
  const { name, merchantName } = transaction;
  const where: TransactionsWhereClause = {};
  if (merchantName && name) {
    Object.assign(where, {
      [Op.or]: { merchantName, name },
    });
  } else if (merchantName) {
    where.merchantName = merchantName;
  } else if (name) {
    where.name = name;
  }

  const txCount = await Transaction.findAll({
    attributes: [
      [sequelize.fn('count', sequelize.col('transaction.id')), 'txCount'],
    ],
    include: [
      {
        model: Account,
        include: [
          {
            model: Item,
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

export const setSimilarTransactionsCategory = async (
  userId: number,
  transactionId: number,
  categoryId: number,
) => {
  const transaction = await getTransaction(userId, transactionId);
  const category = await getCategory(categoryId);

  if (
    !transaction ||
    !category ||
    (category.userId !== userId && category.userId !== -1)
  ) {
    return null;
  }
  const { name, merchantName } = transaction;
  const where: TransactionsWhereClause = {};
  if (merchantName && name) {
    Object.assign(where, {
      [Op.or]: { merchantName, name },
    });
  } else if (merchantName) {
    where.merchantName = merchantName;
  } else if (name) {
    where.name = name;
  }
  const updTransactions = await Transaction.update({ categoryId }, { where });
  return updTransactions;
};

export const getCumulativeSpending = async (
  userId: number,
  options: GetCumulativeSpendingOptions,
) => {
  // const queryDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit',
  // });

  // const startDate = queryDateFormatter.format(options.startDate);
  // const endDate = queryDateFormatter.format(options.endDate);

  const { startDate, endDate } = options;

  const spending = sequelize.query(
    `SELECT i.day, SUM(i.amount) OVER(ORDER BY i.day) "txAmount"
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
  `,
    { type: QueryTypes.SELECT },
  );

  return spending;
};

export const getSpending = async (
  userId: number,
  options?: GetSpendingByOptions,
) => {
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};
  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const refDate = options?.refDate;
  const accountIds = options?.accountIds;
  const categoryIds = options?.categoryIds;
  const selectColumns = options?.aggregateBy || [];
  const aggregateBy =
    options?.aggregateBy?.map((e) => (Array.isArray(e) ? e[1] : e)) || [];

  if (refDate) {
    const dates = await Calendar.findOne({
      where: { calendar_date: refDate },
    });
    where['$calendar.calendar_date$'] = {
      [Op.between]: [dates?.curr_month_start_date, dates?.curr_month_end_date],
    };
  }
  if (startDate && endDate) {
    where['$calendar.calendar_date$'] = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where['$calendar.calendar_date$'] = { [Op.gte]: startDate };
  } else if (endDate) {
    where['$calendar.calendar_date$'] = { [Op.lte]: endDate };
  }

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }
  if (categoryIds) {
    where['$category.id$'] = { [Op.in]: categoryIds };
  }

  where['$account->item.userId$'] = userId;

  const having = options?.removeZeroCounts
    ? sequelize.where(
        sequelize.literal(
          'COUNT(CASE WHEN transaction.exclude = true OR category.exclude=true THEN null ELSE transaction.id END)',
        ),
        {
          [Op.gt]: 0,
        },
      )
    : {};

  const spendingSummary = await Transaction.findAll({
    attributes: [
      ...selectColumns,
      [
        sequelize.literal(
          'COALESCE(SUM(CASE WHEN transaction.exclude = true OR category.exclude=true THEN 0 ELSE amount END),0)',
        ),
        'txAmount',
      ],
      [
        sequelize.literal(
          'COUNT(CASE WHEN transaction.exclude = true OR category.exclude=true THEN null ELSE transaction.id END)',
        ),
        'txCount',
      ],
    ],
    where,
    include: [
      {
        model: Calendar,
        attributes: [],
        required: false,
        right: true,
      },
      {
        model: Category,
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
        model: Account,
        where: accountWhere,
        required: false,
        attributes: [],
        include: [
          {
            model: Item,
            required: false,
            attributes: [],
            include: [
              {
                model: Institution,
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
