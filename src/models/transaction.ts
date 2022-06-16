/* eslint-disable @typescript-eslint/indent */
/* eslint-disable import/no-cycle */

import { TransactionPaymentChannelEnum } from 'plaid';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../utils/db';
import Account from './account';
import Category from './category';
import PlaidCategory from './plaidCategory';

class Transaction extends Model<
  InferAttributes<Transaction>,
  InferCreationAttributes<Transaction>
> {
  declare id: CreationOptional<number>;

  declare plaidTransactionId: string;

  declare accountId: ForeignKey<Account['id']>;

  declare name: string;

  declare amount: number;

  declare transactionDate: Date;

  declare pending: boolean;

  declare plaidCategoryId: ForeignKey<PlaidCategory['id']>;

  declare categoryId: ForeignKey<Category['id']>;

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
    plaidTransactionId: {
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
        exclude: ['id', 'createdAt', 'updatedAt', 'unofficialCurrencyCode'],
      },
    },
  },
);

export default Transaction;
