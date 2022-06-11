/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  Association,
  NonAttribute,
} from 'sequelize';
import { Item as PlaidItem } from 'plaid';
import { sequelize } from '../utils/db';
// eslint-disable-next-line import/no-cycle
import User from './user';
import Institution from './institution';
import Account from './account';

// TODO: Sync validation with front-end
class Item extends Model<InferAttributes<Item>, InferCreationAttributes<Item>> {
  declare id: CreationOptional<number>;

  declare plaidItemId: string;

  declare userId: ForeignKey<User['id']>;

  declare accessToken: string;

  declare institutionId: ForeignKey<Institution['id']> | null;

  declare consentExpirationTime: string | null;

  declare status: string;

  declare transactionCursor: string | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  // associations
  declare getAccounts: HasManyGetAssociationsMixin<Account>;

  declare addAccounts: HasManyAddAssociationMixin<Account, number>;

  declare addAccount: HasManyAddAssociationsMixin<Account, number>;

  declare setAccounts: HasManySetAssociationsMixin<Account, number>;

  declare removeAccounts: HasManyRemoveAssociationMixin<Account, number>;

  declare removeAccount: HasManyRemoveAssociationsMixin<Account, number>;

  declare hasAccounts: HasManyHasAssociationMixin<Account, number>;

  declare hasAccount: HasManyHasAssociationsMixin<Account, number>;

  declare countAccounts: HasManyCountAssociationsMixin;

  declare createAccounts: HasManyCreateAssociationMixin<Account, 'itemId'>;

  declare accounts: NonAttribute<Account[]>;

  declare institution: NonAttribute<Institution>;

  declare static associations: {
    Accounts: Association<Item, Account>;
  };
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    plaidItemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transactionCursor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    consentExpirationTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'items',
    modelName: 'item',
  },
);

export const getItemByPlaidItemId = async (plaidItemId: string) => {
  const item = await Item.findOne({
    where: { plaidItemId },
  });
  return item;
};

export const getItemByUserId = async (userId: number) => {
  const item = await Item.findOne({
    where: { userId },
  });
  return item;
};

export const createItem = async (
  itemData: PlaidItem,
  access_token: string,
  userId: number,
) => {
  let institutionId = null;
  if (itemData.institution_id) {
    const inst = await Institution.findOne({
      where: { plaidInstitutionId: itemData.institution_id },
      attributes: ['id'],
    });
    if (inst) institutionId = inst.id;
  }

  const newItem = await Item.create({
    accessToken: access_token,
    plaidItemId: itemData.item_id,
    userId,
    institutionId,
    status: 'good',
    consentExpirationTime: itemData.consent_expiration_time,
  });
  return newItem;
};

// TODO: check on refreshing status and expiration
export const updateItem = async (
  item: Item,
  itemData: PlaidItem,
  access_token: string,
) => {
  const updItem = await item.update({
    accessToken: access_token,
    consentExpirationTime: itemData.consent_expiration_time,
  });
  return updItem;
};

export const updateItemTransactionsCursor = async (
  plaidItemId: string,
  transactionsCursor: string | null,
) => {
  const item = await getItemByPlaidItemId(plaidItemId);
  item?.set('transactionCursor', transactionsCursor);
  item?.save();
};

export const createOrUpdateItem = async (
  itemData: PlaidItem,
  access_token: string,
  userId: number,
) => {
  const item = await Item.findOne({
    where: { plaidItemId: itemData.item_id },
  });
  if (item) {
    return updateItem(item, itemData, access_token);
  }
  return createItem(itemData, access_token, userId);
};

export default Item;
