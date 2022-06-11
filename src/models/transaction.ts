/* eslint-disable @typescript-eslint/indent */
import {
  Transaction as PlaidTransaction,
  TransactionPaymentChannelEnum,
} from 'plaid';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../utils/db';
import Account, { getAccountByPlaidAccountId } from './account';
import Item from './item';

class Transaction extends Model<
  InferAttributes<Transaction>,
  InferCreationAttributes<Transaction>
> {
  declare id: CreationOptional<number>;

  declare pladiTransactionId: string;

  declare accountId: ForeignKey<Account['id']>;

  declare name: string;

  declare amount: number;

  declare transactionDate: Date;

  declare pending: boolean;

  declare pladiCategoryId: string | null;

  declare category: string | null;

  declare subCategory: string | null;

  declare paymentChannel: TransactionPaymentChannelEnum;

  declare address: string | null;

  declare city: string | null;

  declare country: string | null;

  declare merchantName: string | null;

  declare isoCurrencyCode: string | null;

  declare unofficialCurrencyCode: string | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Transaction.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    pladiTransactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    pladiCategoryId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentChannel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isoCurrencyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unofficialCurrencyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merchantName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    modelName: 'transaction',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'unofficialCurrencyCode'],
      },
    },
  },
);

// eslint-disable-next-line import/prefer-default-export
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

export const getTransactionsByAccountAndUser = async (
  accountId: number,
  userId: number,
) => {
  const transactions = await Transaction.findAll({
    include: {
      model: Account,
      where: { id: accountId },
      include: [{ model: Item, where: { userId }, attributes: [] }],
      attributes: [],
    },
  });
  return transactions;
};

export default Transaction;
