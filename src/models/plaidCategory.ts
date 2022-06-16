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
  Association,
} from 'sequelize';
import { sequelize } from '../utils/db';
import Category from './category';
// eslint-disable-next-line import/no-cycle

// TODO: Sync validation with front-end
class PlaidCategory extends Model<
  InferAttributes<PlaidCategory>,
  InferCreationAttributes<PlaidCategory>
> {
  declare id: CreationOptional<number>;

  declare categoryId: ForeignKey<Category['id']>;

  declare code: string;

  declare name_lvl1: string | null;

  declare name_lvl2: string | null;

  declare name_lvl3: string | null;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    Accounts: Association<PlaidCategory, Category>;
  };
}

PlaidCategory.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name_lvl1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_lvl2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name_lvl3: {
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
    tableName: 'plaid_categories',
    modelName: 'plaidCategory',
  },
);

export const getPlaidCategoryByCode = async (code: string) => {
  const plaidCategory = await PlaidCategory.findOne({
    where: { code },
  });
  if (!plaidCategory) throw Error('Category Id not found');
  return plaidCategory;
};

export default PlaidCategory;
