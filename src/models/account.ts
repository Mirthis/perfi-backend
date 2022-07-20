/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import { AccountBase, AccountSubtype, AccountType } from 'plaid';
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
  QueryTypes,
} from 'sequelize';
import { AccountsWithStats } from '../types/types';
import { sequelize } from '../utils/db';
import Institution from './institution';
import Item from './item';

// TODO: Sync validation with front-end
class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare id: CreationOptional<number>;

  declare plaidAccountId: string;

  declare itemId: ForeignKey<Item['id']>;

  declare name: string;

  declare officialName: string | null;

  declare type: AccountType | null;

  declare subType: AccountSubtype | null;

  declare mask: string | null;

  declare currentBalance: number | null;

  declare availableBalance: number | null;

  declare isoCurrencyCode: string | null;

  declare unofficialCurrencyCode: string | null;

  declare item: NonAttribute<Item>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Account.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plaidAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    officialName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mask: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentBalance: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    availableBalance: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    isoCurrencyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unofficialCurrencyCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    modelName: 'account',
    defaultScope: {
      attributes: {
        exclude: ['unofficialCurrencyCode', 'createdAt', 'updatedAt', 'mask'],
      },
    },
  },
);

export const getAccountByPlaidAccountId = async (plaidAccountId: string) => {
  const account = await Account.findOne({
    where: { plaidAccountId },
    include: [{ model: Item }],
  });
  if (!account) throw Error('Account id not found');
  return account;
};

export const createOrUpdateAccount = async (
  accountData: AccountBase,
  itemId: number,
) => {
  const accountVal = {
    itemId,
    plaidAccountId: accountData.account_id,
    name: accountData.name,
    mask: accountData.mask,
    officialName: accountData.official_name,
    availableBalance: accountData.balances.available,
    currentBalance: accountData.balances.current,
    isoCurrencyCode: accountData.balances.iso_currency_code,
    unofficialCurrencyCode: accountData.balances.unofficial_currency_code,
    subType: accountData.subtype,
    type: accountData.type,
  };
  const [account] = await Account.upsert(accountVal);
  return account;
};

export const createOrUpdateAccounts = async (
  accountsData: AccountBase[],
  plaidItemId: string,
) => {
  const item = await Item.findOne({ where: { plaidItemId } });
  if (!item) return null;

  const accounts = await Promise.all<Account>(
    accountsData.map((acc) => createOrUpdateAccount(acc, item.id)),
  );
  return accounts;
};

export const getAccounts = async (userId: number) => {
  const accounts = await Account.findAll({
    include: {
      model: Item,
      where: { userId },
      include: [
        {
          model: Institution,
          attributes: { exclude: ['createdAt', 'updatedAt', 'mask'] },
        },
      ],
      attributes: ['id', 'status'],
    },
  });
  return accounts;
};

export const getAccountsWithStats = async (
  userId: number,
  monthKey: string,
) => {
  const accounts = await sequelize.query<AccountsWithStats>(
    `
  SELECT
acc.id id,
acc.name "name",
acc."officialName" "officialName",
acc.type "type",
acc."subType" "subType",
acc."currentBalance" "currentBalance",
acc."isoCurrencyCode"  "isoCurrencyCode",
inst.id "institutionId",
inst.name  "institutionName",
inst.color  "institutionColor",
inst.logo  "institutionLogo",
SUM(CASE WHEN cal.calendar_date >= cal_filter.curr_month_start_date
		  AND cal.calendar_date <= cal_filter.curr_month_end_date THEN tx.amount
   ELSE 0 END) "currMonthAmount",
SUM(CASE WHEN cal.calendar_date >= cal_filter.prev_month_start_date
		  AND cal.calendar_date <= cal_filter.prev_month_end_date THEN tx.amount
   ELSE 0 END) "prevMonthAmount",
SUM(CASE WHEN cal.calendar_date >= cal_filter.curr_year_start_date
		  AND cal.calendar_date <= cal_filter.curr_year_end_date THEN tx.amount
   ELSE 0 END) "currYearAmount"
FROM accounts acc INNER JOIN transactions tx
ON acc."id" = tx."accountId"
INNER JOIN items it
ON acc."itemId" = it.id
INNER JOIN institutions inst
ON it."institutionId" = inst.id
INNER JOIN (
SELECT *,
	  (CASE WHEN prev_month_start_date < curr_year_start_date 
	   THEN prev_month_start_date
	   ELSE curr_year_start_date
	   END) as start_date,
	   curr_month_end_date as end_date
from calendar
WHERE calendar_date='${monthKey}'
) cal_filter
ON 1 = 1
INNER JOIN calendar cal
ON tx."calendarId" = cal.id
INNER JOIN categories cat
ON tx."categoryId" = cat.id
WHERE cal.calendar_date BETWEEN cal_filter.start_date AND cal_filter.end_date
AND it."userId"=${userId}
AND tx.exclude = false
AND cat.exclude = false
GROUP BY 
acc.id,
acc.name,
acc.type,
acc."subType",
acc."currentBalance",
acc."isoCurrencyCode",
inst.id,
inst.name,
inst.color,
inst.logo
;
  `,
    { type: QueryTypes.SELECT },
  );

  const updAccounts = accounts.map((acc) => ({
    ...acc,
    institutionLogo: acc.institutionLogo.toString('base64'),
  }));

  return updAccounts;
};

export default Account;
