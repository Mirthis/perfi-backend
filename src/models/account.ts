/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import { AccountSubtype, AccountType } from 'plaid';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import { sequelize } from '../utils/db';
import Item from './item';
import Transaction from './transaction';

// TODO: Sync validation with front-end
class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare id: CreationOptional<number>;

  declare plaidAccountId: string;

  declare itemId: ForeignKey<Item['id']>;

  declare name: string;

  declare officialName: string | null;

  declare type: AccountType | null;

  declare subType: AccountSubtype | null;

  declare mask: string | null;

  declare currentBalance: number | null;

  declare availableBalance: number | null;

  declare isoCurrencyCode: string | null;

  declare unofficialCurrencyCode: string | null;

  declare item: NonAttribute<Item>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare transactions: NonAttribute<Transaction[]>;
}

Account.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plaidAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    officialName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mask: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentBalance: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    availableBalance: {
      type: DataTypes.DECIMAL,
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
    tableName: 'accounts',
    modelName: 'account',
    defaultScope: {
      attributes: {
        exclude: ['unofficialCurrencyCode', 'createdAt', 'updatedAt', 'mask'],
      },
    },
  },
);

export default Account;
