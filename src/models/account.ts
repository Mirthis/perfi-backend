/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import { AccountBase, AccountSubtype, AccountType } from 'plaid';
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
import Institution from './institution';
import Item from './item';

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
  },
);

export const getAccountByPlaidAccountId = async (plaidAccountId: string) => {
  const account = await Account.findOne({
    where: { plaidAccountId },
  });
  return account;
};

export const createOrUpdateAccount = async (
  accountData: AccountBase,
  itemId: number,
) => {
  const accountVal = {
    itemId,
    plaidAccountId: accountData.account_id,
    name: accountData.name,
    mask: accountData.mask,
    officialName: accountData.official_name,
    availableBalance: accountData.balances.available,
    currentBalance: accountData.balances.current,
    isoCurrencyCode: accountData.balances.iso_currency_code,
    unofficialCurrencyCode: accountData.balances.unofficial_currency_code,
    subType: accountData.subtype,
    type: accountData.type,
  };
  const [account] = await Account.upsert(accountVal);
  return account;
};

export const createOrUpdateAccounts = async (
  accountsData: AccountBase[],
  plaidItemId: string,
) => {
  const item = await Item.findOne({ where: { plaidItemId } });
  if (!item) return null;

  const accounts = await Promise.all<Account>(
    accountsData.map((acc) => createOrUpdateAccount(acc, item.id)),
  );
  return accounts;
};

export const getAccountsByUserId = async (userId: number) => {
  // const items = await Item.findAll({
  //   include: [Account, Institution],
  //   where: { userId },
  // });
  // // console.log(items[0].Institution);
  // console.log(userId);
  const accounts = await Account.findAll({
    attributes: {
      exclude: [
        'unofficialCurrencyCode',
        'createdAt',
        'updatedAt',
        'mask',
        'itemId',
      ],
    },
    include: {
      model: Item,
      where: { userId },
      include: [
        {
          model: Institution,
          attributes: { exclude: ['createdAt', 'updatedAt', 'mask'] },
        },
      ],
      attributes: ['id', 'status'],
    },
  });
  return accounts;
};

export default Account;
