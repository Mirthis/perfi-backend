import { Transaction as PlaidTransaction } from 'plaid';
import { Op } from 'sequelize';
import Account, { getAccountByPlaidAccountId } from './account';
import Item from './item';
import Transaction from './transaction';
import { sequelize } from '../utils/db';
import { getPlaidCategoryByCode } from './plaidCategory';
import Category from './category';
import {
  AccountWhereClause,
  GetCategoriesSummaryOptions,
  GetTransactionsOptions,
  TransactionsWhereClause,
} from '../types/types';

export const getTransactions = async (
  userId: number,
  options?: GetTransactionsOptions,
) => {
  const where: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;
  const accountIds = options?.accountIds;

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
  console.log(accountIds);
  console.log(accountWhere);

  const transactions = await Transaction.findAndCountAll({
    include: {
      model: Account,
      where: accountWhere,
      include: [{ model: Item, where: { userId }, attributes: [] }],
      attributes: [],
    },
    where,
    order: [['txD', 'DESC']],
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
    // if (!categoryIds) {
    //   categoryIds = { categoryId: -1, plaidCategoryId: -1 };
    // }
    const transValues = {
      plaidTransactionId: transaction.transaction_id,
      accountId,
      name: transaction.name,
      amount: transaction.amount,
      txDate: new Date(transaction.date),
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

// export const getTransactionsByUserId = async (userId: number) => {
//   const transactions = await Item.findAll({
//     include: { model: Account, include: [Transaction] },
//     where: { userId },
//   });
//   return transactions;
// };

// export const getTransactionsByAccount = async (
//   userId: number,
//   options?: GetTransactionsOptions,
// ) => {
//   const where:
//     | WhereOptions<
//         InferAttributes<
//           Transaction,
//           {
//             omit: never;
//           }
//         >
//       >
//     | undefined = {};

//   const accountWhere:
//     | WhereOptions<
//         InferAttributes<
//           Transaction,
//           {
//             omit: never;
//           }
//         >
//       >
//     | undefined = {};

//   const startDate = options?.startDate;
//   const endDate = options?.endDate;
//   const offset = options?.offset || 0;
//   const limit = options?.limit || 30;

//   if (startDate && endDate) {
//     where.transactionDate = { [Op.between]: [startDate, endDate] };
//   } else if (startDate) {
//     where.transactionDate = { [Op.gte]: startDate };
//   } else if (endDate) {
//     where.transactionDate = { [Op.lte]: endDate };
//   }

//   const transactions = await Transaction.findAndCountAll({
//     include: {
//       model: Account,
//       where: accountWhere,
//       include: [{ model: Item, where: { userId }, attributes: [] }],
//       attributes: [],
//     },
//     where,
//     order: [['transactionDate', 'DESC']],
//     offset,
//     limit,
//   });
//   return transactions;
// };

// export const getAccountTransactionsSummary = async (
//   accountId: number,
//   userId: number,
// ) => {
//   const txSummary = await Transaction.findAll({
//     attributes: [
//       [sequelize.fn('min', sequelize.col('transactionDate')), 'minDate'],
//       [sequelize.fn('max', sequelize.col('transactionDate')), 'maxDate'],
//     ],
//     include: {
//       model: Account,
//       where: { id: accountId },
//       include: [{ model: Item, where: { userId }, attributes: [] }],
//       attributes: [],
//     },
//     raw: true,
//   });

//   // console.log(userId);
//   // const txSummary = Account.findOne({
//   //   attributes: ['id'],
//   //   include: {
//   //     model: Transaction,
//   //     attributes: { include: ['amount'], exclude: ['transactions.id'] },
//   //   },
//   //   where: { id: accountId },
//   //   group: ['account.id'],
//   //   raw: true,
//   // });

//   return txSummary;
// };

export const getTransactionsCategorySummary = async (
  userId: number,
  options?: GetCategoriesSummaryOptions,
) => {
  console.log(options);
  const transactionWhere: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const accountIds = options?.accountIds;

  if (startDate && endDate) {
    transactionWhere.txDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    transactionWhere.txDate = { [Op.gte]: startDate };
  } else if (endDate) {
    transactionWhere.txDate = { [Op.lte]: endDate };
  }

  console.log(transactionWhere);

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }

  const categorySummary = await Transaction.findAll({
    attributes: [
      'category.id',
      'category.name',
      'category.iconName',
      'category.iconColor',
      [sequelize.fn('sum', sequelize.col('amount')), 'txAmount'],
      [sequelize.fn('count', sequelize.col('transaction.id')), 'txCount'],
    ],
    include: [
      {
        model: Category,
        required: true,
        attributes: [],
      },
      {
        model: Account,
        where: accountWhere,

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
    where: transactionWhere,
    group: [
      'category.id',
      'category.name',
      'category.iconName',
      'category.iconColor',
    ],
    raw: true,
  });

  return categorySummary;
};

export const getTransactionsSummary = async (userId: number) => {
  const transactionsSummary = await Transaction.findAll({
    attributes: [
      [sequelize.literal('extract(year from "txDate")'), 'year'],
      [sequelize.literal('extract(month from "txDate")'), 'month'],
      [sequelize.fn('sum', sequelize.col('amount')), 'txAmount'],
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
    group: ['year', 'month'],
    order: [
      [sequelize.literal('extract(year from "txDate")'), 'DESC'],
      [sequelize.literal('extract(month from "txDate")'), 'DESC'],
    ],
    raw: true,
  });

  return transactionsSummary;
};
