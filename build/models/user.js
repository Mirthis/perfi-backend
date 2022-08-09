"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../utils/db");
// TODO: Sync validation with front-end
class User extends sequelize_1.Model {
    // declare comparePassword: (pass: string) => void;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    // }
    async verifyPassword(password) {
        const match = await bcrypt_1.default.compare(password, this.password);
        return match;
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(320),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Email need to be a valid email' },
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
        validate: {
            is: {
                args: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/],
                msg: 'Password must be at least 8 characters long and contains at least one upper case letter, one lower case letter a number and a symbol',
            },
        },
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    tableName: 'users',
    modelName: 'user',
});
User.beforeSave(async (user) => {
    if (user.changed('password')) {
        user.password = bcrypt_1.default.hashSync(user.password, bcrypt_1.default.genSaltSync(10));
    }
});
exports.default = User;
