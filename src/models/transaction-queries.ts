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
  ExcludedTransactionsFilter,
  GetSpendingByCategoryOptions,
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

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;
  const accountIds = options?.accountIds;
  const categoryIds = options?.categoryIds;
  const order: Order = options?.orderBy
    ? [[options?.orderBy, 'DESC']]
    : [['calendarId', 'DESC']];
  const excludedTransactionsFilter = options?.excludedTransactions;

  console.log('excludedTransactionsFilter');
  console.log(excludedTransactionsFilter);

  switch (Number(excludedTransactionsFilter)) {
    case ExcludedTransactionsFilter.ALL:
      console.log('all');
      break;
    case ExcludedTransactionsFilter.ONLY_EXCLUDED:
      console.log('excluded');

      Object.assign(where, {
        [Op.or]: { exclude: true, '$category.exclude$': true },
      });
      // @ts-ignore
      // where[Op.or] = { exclude: true, '$category.exclude$': true };
      // where.exclude = true;
      // categoryWhere.exclude = true;
      break;
    case ExcludedTransactionsFilter.ONLY_INCLUDED:
      console.log('included');
      Object.assign(where, {
        [Op.and]: { exclude: false, '$category.exclude$': false },
      });
      // @ts-ignore
      // where.exclude = false;
      // categoryWhere.exclude = false;
      break;
    default:
      console.log('default');
      Object.assign(where, {
        [Op.and]: { exclude: false, '$category.exclude$': false },
      });
      // categoryWhere.exclude = false;
      break;
  }

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
  const where: TransactionsWhereClause = { [Op.or]: { merchantName, name } };
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
      console.log(latestSimilarTx);
      console.log(categoryIds);
      console.log(transaction);
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
    };

    Transaction.create(transValues);
  });
  await Promise.all(pendingQueries);
};

export const getSpendingByCategory = async (
  userId: number,
  options?: GetSpendingByCategoryOptions,
) => {
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

export const getSimilarTransactionsIds = async (
  userId: number,
  transactionId: number,
) => {
  const transaction = await getTransaction(userId, transactionId);

  if (!transaction) {
    return null;
  }
  const { name, merchantName } = transaction;
  const where: TransactionsWhereClause = { [Op.or]: { merchantName, name } };
  const transactions = await Transaction.findAndCountAll({
    attributes: ['id'],
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
  });
  return transactions;
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
  const where: TransactionsWhereClause = { [Op.or]: { merchantName, name } };
  const updTransactions = await Transaction.update({ categoryId }, { where });
  return updTransactions;
};
