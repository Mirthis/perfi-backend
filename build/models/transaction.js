"use strict";
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable import/no-cycle */
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
class Transaction extends sequelize_1.Model {
}
Transaction.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    plaidTransactionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL,
        allowNull: false,
    },
    txDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    txDatetime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    pending: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    paymentChannel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
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
    merchantName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    exclude: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    personal_finance_primary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    personal_finance_detailed: {
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
    tableName: 'transactions',
    modelName: 'transaction',
    defaultScope: {
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'unofficialCurrencyCode'],
        },
    },
});
exports.default = Transaction;
