"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// prettier-ignore
class AuthToken extends sequelize_1.Model {
}
AuthToken.init({
    token: {
        allowNull: false,
        primaryKey: true,
        type: sequelize_1.DataTypes.STRING(64),
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('verify_email', 'reset_password'),
        allowNull: false,
    },
    createdAt: {
        allowNull: false,
        type: sequelize_1.DataTypes.DATE,
    },
    expireAt: {
        allowNull: false,
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: db_1.sequelize,
    updatedAt: false,
    tableName: 'auth_tokens',
    modelName: 'authToken',
});
exports.default = AuthToken;
