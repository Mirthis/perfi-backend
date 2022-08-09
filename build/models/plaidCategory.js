"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaidCategoryByCode = void 0;
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// eslint-disable-next-line import/no-cycle
// TODO: Sync validation with front-end
class PlaidCategory extends sequelize_1.Model {
}
PlaidCategory.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name_lvl1: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    name_lvl2: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    name_lvl3: {
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
    tableName: 'plaid_categories',
    modelName: 'plaidCategory',
});
const getPlaidCategoryByCode = async (code) => {
    const plaidCategory = await PlaidCategory.findOne({
        where: { code },
    });
    if (!plaidCategory)
        throw Error('Category Id not found');
    return plaidCategory;
};
exports.getPlaidCategoryByCode = getPlaidCategoryByCode;
exports.default = PlaidCategory;
