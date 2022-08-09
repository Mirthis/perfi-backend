"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// prettier-ignore
class Session extends sequelize_1.Model {
}
Session.init({
    sid: {
        type: sequelize_1.DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
    },
    expires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    data: {
        type: sequelize_1.DataTypes.TEXT,
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
    timestamps: true,
    tableName: 'sessions',
    modelName: 'session',
});
exports.default = Session;
