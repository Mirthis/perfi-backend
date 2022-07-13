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
// eslint-disable-next-line import/no-cycle
import User from './user';

// TODO: Sync validation with front-end
class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;

  declare userId: ForeignKey<User['id']>;

  declare name: string;

  declare iconName: string;

  declare iconColor: string;

  declare exclude: boolean;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    Accounts: Association<Category, User>;
  };
}

Category.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    iconName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iconColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exclude: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'categories',
    modelName: 'category',
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    },
  },
);

export default Category;
