import { AccountBase } from 'plaid';
import { QueryTypes } from 'sequelize';
import { AccountsWithStats } from '../types/types';
import { sequelize } from '../utils/db';
import Account from './account';
import Institution from './institution';
import Item from './item';

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

export const getAccounts = async (userId: number, institutionId?: number) => {
  const accounts = await Account.findAll({
    include: {
      model: Item,
      where: { userId },
      include: [
        {
          model: Institution,
          where: institutionId ? { id: institutionId } : {},
          attributes: { exclude: ['createdAt', 'updatedAt', 'mask'] },
        },
      ],
      attributes: ['id', 'status', 'consentExpirationTime', 'lastSynced'],
    },
  });
  return accounts;
};

export const deleteAccount = async (accountId: number) => {
  const deleted = Account.destroy({
    where: { id: accountId },
  });
  return deleted;
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
