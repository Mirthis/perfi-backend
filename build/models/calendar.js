"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDates = void 0;
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// TODO: Sync validation with front-end
class Calendar extends sequelize_1.Model {
}
Calendar.init({
    id: {
        allowNull: false,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    calendar_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    month: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    week: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    day: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    week_day: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    week_day_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    curr_month_start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    curr_month_end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_month_start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_month_end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    curr_year_start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    curr_year_end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_year_start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_year_end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_12_month_start_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    prev_12_month_end_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    timestamps: false,
    sequelize: db_1.sequelize,
    tableName: 'calendar',
    modelName: 'calendar',
});
const getDates = async (refDate) => {
    const dates = await Calendar.findOne({ where: { calendar_date: refDate } });
    return dates;
};
exports.getDates = getDates;
exports.default = Calendar;
