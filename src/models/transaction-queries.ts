import { Transaction as PlaidTransaction } from 'plaid';
import { InferAttributes, Op, WhereOptions } from 'sequelize';
import Account, { getAccountByPlaidAccountId } from './account';
import Item from './item';
import Transaction from './transaction';
import { sequelize } from '../utils/db';

interface GetTransactionsOptions {
  offset?: number;
  limit?: number;
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export const getTransactions = async (
  userId: number,
  options?: GetTransactionsOptions,
) => {
  const where:
    | WhereOptions<
        InferAttributes<
          Transaction,
          {
            omit: never;
          }
        >
      >
    | undefined = {};

  const accountWhere:
    | WhereOptions<
        InferAttributes<
          Transaction,
          {
            omit: never;
          }
        >
      >
    | undefined = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;
  const accountIds = options?.accountIds;

  if (startDate && endDate) {
    where.transactionDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.transactionDate = { [Op.gte]: startDate };
  } else if (endDate) {
    where.transactionDate = { [Op.lte]: endDate };
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
    order: [['transactionDate', 'DESC']],
    offset,
    limit,
  });
  return transactions;
};

export const createOrUpdateTransactions = async (
  transactions: PlaidTransaction[],
) => {
  const accIds = new Map<string, number>();
  const pendingQueries = transactions.map(async (transaction) => {
    const plaidAccountId = transaction.account_id;
    let accountId = accIds.get(plaidAccountId);
    if (!accountId) {
      const { id } = (await getAccountByPlaidAccountId(
        plaidAccountId,
      )) as Account;
      accountId = id;
      accIds.set(plaidAccountId, id);
    }

    const transValues = {
      pladiTransactionId: transaction.transaction_id,
      accountId,
      name: transaction.name,
      amount: transaction.amount,
      transactionDate: new Date(transaction.date),
      pending: transaction.pending,
      pladiCategoryId: transaction.category_id,
      category: transaction.category ? transaction.category[0] : null,
      subCategory: transaction.category ? transaction.category[1] : null,
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

export const getTransactionsByUserId = async (userId: number) => {
  const transactions = await Item.findAll({
    include: { model: Account, include: [Transaction] },
    where: { userId },
  });
  return transactions;
};

export const getTransactionsByAccount = async (
  userId: number,
  options?: GetTransactionsOptions,
) => {
  const where:
    | WhereOptions<
        InferAttributes<
          Transaction,
          {
            omit: never;
          }
        >
      >
    | undefined = {};

  const accountWhere:
    | WhereOptions<
        InferAttributes<
          Transaction,
          {
            omit: never;
          }
        >
      >
    | undefined = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const offset = options?.offset || 0;
  const limit = options?.limit || 30;

  if (startDate && endDate) {
    where.transactionDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.transactionDate = { [Op.gte]: startDate };
  } else if (endDate) {
    where.transactionDate = { [Op.lte]: endDate };
  }

  const transactions = await Transaction.findAndCountAll({
    include: {
      model: Account,
      where: accountWhere,
      include: [{ model: Item, where: { userId }, attributes: [] }],
      attributes: [],
    },
    where,
    order: [['transactionDate', 'DESC']],
    offset,
    limit,
  });
  return transactions;
};

export const getAccountTransactionsSummary = async (
  accountId: number,
  userId: number,
) => {
  const txSummary = await Transaction.findAll({
    attributes: [
      [sequelize.fn('min', sequelize.col('transactionDate')), 'minDate'],
      [sequelize.fn('max', sequelize.col('transactionDate')), 'maxDate'],
    ],
    include: {
      model: Account,
      where: { id: accountId },
      include: [{ model: Item, where: { userId }, attributes: [] }],
      attributes: [],
    },
    raw: true,
  });

  // console.log(userId);
  // const txSummary = Account.findOne({
  //   attributes: ['id'],
  //   include: {
  //     model: Transaction,
  //     attributes: { include: ['amount'], exclude: ['transactions.id'] },
  //   },
  //   where: { id: accountId },
  //   group: ['account.id'],
  //   raw: true,
  // });

  return txSummary;
};
