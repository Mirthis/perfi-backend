"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// TODO: Sync validation with front-end
class Account extends sequelize_1.Model {
}
Account.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    plaidAccountId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    officialName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    subType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    mask: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    currentBalance: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true,
    },
    availableBalance: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: true,
    },
    isoCurrencyCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    unofficialCurrencyCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'accounts',
    modelName: 'account',
    defaultScope: {
        attributes: {
            exclude: ['unofficialCurrencyCode', 'createdAt', 'updatedAt', 'mask'],
        },
    },
});
exports.default = Account;
