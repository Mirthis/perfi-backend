import { Transaction as PlaidTransaction } from 'plaid';
import { Op, Order } from 'sequelize';
import Account, { getAccountByPlaidAccountId } from './account';
import Item from './item';
import Transaction from './transaction';
import { sequelize } from '../utils/db';
import PlaidCategory, { getPlaidCategoryByCode } from './plaidCategory';
import Category from './category';
import {
  AccountWhereClause,
  CategoryWhereClause,
  GetSpendingByCategoryOptions,
  GetTopMerchantsOptions,
  GetTransactionsOptions,
  TransactionsWhereClause,
} from '../types/types';
import Calendar from './calendar';
import Institution from './institution';

export const getTransactions = async (
  userId: number,
  options?: GetTransactionsOptions,
) => {
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};
  const categoryWhere: CategoryWhereClause = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;
  const accountIds = options?.accountIds;
  const categoryIds = options?.categoryIds;
  const order: Order = options?.orderBy
    ? [[options?.orderBy, 'DESC']]
    : [['calendarId', 'DESC']];

  if (startDate && endDate) {
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

  console.log('accountWIds', accountIds);
  console.log('accountWhere', accountWhere);
  console.log('categoryIds', categoryIds);
  console.log('categoryWhere', categoryWhere);

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
        attributes: ['id', 'name', 'iconName', 'iconColor'],
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

export const createOrUpdateTransactions = async (
  transactions: PlaidTransaction[],
) => {
  // store accountsId retrieved from the database to avoid querying for the same accounts
  const accountIdMapping = new Map<string, number>();
  // store category ids retrieved from the database to avoid querying for the same accounts
  const categoryIdMapping = new Map<
    string,
    { categoryId: number; plaidCategoryId: number }
  >();

  console.log(transactions.length);
  const pendingQueries = transactions.map(async (transaction) => {
    const plaidAccountId = transaction.account_id;
    let accountId = accountIdMapping.get(plaidAccountId);
    if (!accountId) {
      const { id } = await getAccountByPlaidAccountId(plaidAccountId);
      accountId = id;
      accountIdMapping.set(plaidAccountId, id);
    }

    let categoryIds:
      | { categoryId: number; plaidCategoryId: number }
      | undefined;

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
    const txDate = new Date(transaction.date);
    const calendarId =
      txDate.getFullYear() * 10000 + txDate.getMonth() * 100 + txDate.getDate();

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
      paymentChannel: transaction.payment_channel,
      address: transaction.location.address,
      city: transaction.location.city,
      country: transaction.location.country,
      isoCurrencyCode: transaction.iso_currency_code,
      unofficialCurrencyCode: transaction.unofficial_currency_code,
      merchantName: transaction.merchant_name,
    };

    Transaction.upsert(transValues);
  });
  await Promise.all(pendingQueries);
};

export const getSpendingByCategory = async (
  userId: number,
  options?: GetSpendingByCategoryOptions,
) => {
  console.log(options);
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};
  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const accountIds = options?.accountIds;
  const categoryIds = options?.categoryIds;

  if (startDate && endDate) {
    where['$calendar.calendar_date$'] = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where['$calendar.calendar_date$'] = { [Op.gte]: startDate };
  } else if (endDate) {
    where['$calendar.calendar_date$'] = { [Op.lte]: endDate };
  }

  console.log(where);

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }
  if (categoryIds) {
    console.log(categoryIds);
    where['$category.id$'] = { [Op.in]: categoryIds };
  }
  const having = options?.removeZeroCounts
    ? sequelize.where(sequelize.fn('count', sequelize.col('transaction.id')), {
        [Op.gt]: 0,
      })
    : {};

  const categorySummary = await Transaction.findAll({
    attributes: [
      'calendar.year',
      'calendar.month',
      'category.id',
      'category.name',
      'category.iconName',
      'category.iconColor',
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
        model: Category,
        attributes: [['id', 'categoryId']],
        required: false,
        right: true,
        on: {
          [Op.or]: [
            { id: { [Op.eq]: sequelize.col('categoryId') } },
            { '$transaction.id$': null },
          ],
        },
      },
      {
        model: Account,
        where: accountWhere,
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
      'calendar.year',
      'calendar.month',
      'category.id',
      'category.name',
      'category.iconName',
      'category.iconColor',
    ],
    order: [
      [sequelize.col('calendar.year'), 'ASC'],
      [sequelize.col('calendar.month'), 'ASC'],
    ],
    having,
    raw: true,
  });

  return categorySummary;
};

export const getTransactionsSummary = async (
  userId: number,
  options?: GetSpendingByCategoryOptions,
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

  console.log(where);

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
            where: { userId },
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
        'calcName',
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
    group: ['calcName'],
    order: [[sequelize.literal('"txAmount"'), 'DESC']],
    limit,
  });

  return topMerchants;
};

// export const getTopExpenses = async (
//   userId: number,
//   options?: GetTopExpensesOptions,
// ) => {
//   const where: TransactionsWhereClause = {};

//   const startDate = options?.startDate;
//   const endDate = options?.endDate;
//   // TODO: Move default value to config
//   const limit = options?.limit || 5;

//   if (startDate && endDate) {
//     where.txDate = { [Op.between]: [startDate, endDate] };
//   } else if (startDate) {
//     where.txDate = { [Op.gte]: startDate };
//   } else if (endDate) {
//     where.txDate = { [Op.lte]: endDate };
//   }

//   const topExpenses = await Transaction.findAll({
//     include: [
//       {
//         model: Account,
//         include: [
//           {
//             model: Item,
//             where: { userId },
//             attributes: [],
//           },
//         ],
//         attributes: [],
//       },
//     ],
//     order: [['amount', 'DESC']],
//     limit,
//     where,
//   });

//   return topExpenses;
// };
