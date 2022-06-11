/* eslint-disable no-param-reassign */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
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
import bcrypt from 'bcrypt';
import { sequelize } from '../utils/db';
// eslint-disable-next-line import/no-cycle
import Items from './item';

// TODO: Sync validation with front-end
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;

  declare email: string;

  declare password: string;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;

  // associations
  declare getItems: HasManyGetAssociationsMixin<Items>;

  declare addItems: HasManyAddAssociationMixin<Items, number>;

  declare addItem: HasManyAddAssociationsMixin<Items, number>;

  declare setItems: HasManySetAssociationsMixin<Items, number>;

  declare removeItems: HasManyRemoveAssociationMixin<Items, number>;

  declare removeItem: HasManyRemoveAssociationsMixin<Items, number>;

  declare hasItems: HasManyHasAssociationMixin<Items, number>;

  declare hasItem: HasManyHasAssociationsMixin<Items, number>;

  declare countItems: HasManyCountAssociationsMixin;

  declare createItems: HasManyCreateAssociationMixin<Items, 'userId'>;

  declare items?: NonAttribute<Items[]>;

  declare static associations: {
    Items: Association<User, Items>;
  };
  // declare comparePassword: (pass: string) => void;

  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  // static associate(models) {
  //   // define association here
  // }

  async verifyPassword(password: string): Promise<boolean> {
    const match = await bcrypt.compare(password, this.password);
    return match;
  }

  // comparePassword = (passw: string): boolean => {
  //   bcrypt.compare(passw, this.password, (err, isMatch) => true);
  //   // if (err) {
  //   //   return cb(err);
  //   // }
  //   // return cb(null, isMatch);
  // };

  // comparePassword = (
  //   passw: string,
  //   cb: (err: Error | undefined, isMatch: boolean) => void,
  // ) => {
  //   bcrypt.compare(passw, this.password, (err, isMatch) => cb(err, isMatch));
  //   // if (err) {
  //   //   return cb(err);
  //   // }
  //   // return cb(null, isMatch);
  // };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'user',
  },
);

User.beforeSave(async (user: User, _options) => {
  if (user.changed('password')) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
  }
});

export default User;
