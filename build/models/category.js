"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// TODO: Sync validation with front-end
class Category extends sequelize_1.Model {
}
Category.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    iconName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    iconColor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    exclude: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
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
    tableName: 'categories',
    modelName: 'category',
    defaultScope: {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
    },
});
exports.default = Category;
