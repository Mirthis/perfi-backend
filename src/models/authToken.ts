/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  CreationOptional,
} from 'sequelize';
import { AuthTokenType } from '../types/types';
import { sequelize } from '../utils/db';
import User from './user';

// prettier-ignore
class AuthToken extends Model<InferAttributes<AuthToken>, InferCreationAttributes<AuthToken>> {

  declare token:string;

  declare type: AuthTokenType;

  declare userId: ForeignKey<User['id']>;
    
  declare createdAt: CreationOptional<Date>;

  declare expireAt:Date;

}

AuthToken.init(
  {
    token: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(64),
    },
    type: {
      type: DataTypes.ENUM('verify_email', 'reset_password'),
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    expireAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    updatedAt: false,
    tableName: 'auth_tokens',
    modelName: 'authToken',
  },
);

export default AuthToken;
