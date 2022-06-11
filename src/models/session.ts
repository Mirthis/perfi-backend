import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../utils/db';

// prettier-ignore
class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
  declare sid: string;

  declare expires:Date;

  declare data: Text;

  declare createdAt:Date;

  declare updatedAt: Date;
}

Session.init(
  {
    sid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data: {
      type: DataTypes.TEXT,
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
    timestamps: true,
    tableName: 'sessions',
    modelName: 'session',
  },
);

export default Session;
