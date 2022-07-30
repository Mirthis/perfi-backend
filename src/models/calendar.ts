/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../utils/db';

// TODO: Sync validation with front-end
class Calendar extends Model<
  InferAttributes<Calendar>,
  InferCreationAttributes<Calendar>
> {
  declare id: CreationOptional<number>;

  declare calendar_date: Date;

  declare year: number;

  declare month: number;

  declare week: number;

  declare day: number;

  declare week_day: number;

  declare week_day_name: string;

  declare curr_month_start_date: Date;

  declare curr_month_end_date: Date;

  declare prev_month_start_date: Date;

  declare prev_month_end_date: Date;

  declare curr_year_start_date: Date;

  declare curr_year_end_date: Date;

  declare prev_year_start_date: Date;

  declare prev_year_end_date: Date;

  declare prev_12_month_start_date: Date;

  declare prev_12_month_end_date: Date;
}

Calendar.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    calendar_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    week_day: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    week_day_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    curr_month_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    curr_month_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_month_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_month_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    curr_year_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    curr_year_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_year_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_year_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_12_month_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    prev_12_month_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    sequelize,
    tableName: 'calendar',
    modelName: 'calendar',
  },
);

export const getDates = async (refDate: Date) => {
  const dates = await Calendar.findOne({ where: { calendar_date: refDate } });
  return dates;
};

export default Calendar;
