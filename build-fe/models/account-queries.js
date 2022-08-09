"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountsWithStats = exports.deleteAccount = exports.getAccounts = exports.createOrUpdateAccounts = exports.createOrUpdateAccount = exports.getAccountByPlaidAccountId = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
const account_1 = __importDefault(require("./account"));
const institution_1 = __importDefault(require("./institution"));
const item_1 = __importDefault(require("./item"));
const getAccountByPlaidAccountId = async (plaidAccountId) => {
    const account = await account_1.default.findOne({
        where: { plaidAccountId },
        include: [{ model: item_1.default }],
    });
    if (!account)
        throw Error('Account id not found');
    return account;
};
exports.getAccountByPlaidAccountId = getAccountByPlaidAccountId;
const createOrUpdateAccount = async (accountData, itemId) => {
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
    const [account] = await account_1.default.upsert(accountVal);
    return account;
};
exports.createOrUpdateAccount = createOrUpdateAccount;
const createOrUpdateAccounts = async (accountsData, plaidItemId) => {
    const item = await item_1.default.findOne({ where: { plaidItemId } });
    if (!item)
        return null;
    const accounts = await Promise.all(accountsData.map((acc) => (0, exports.createOrUpdateAccount)(acc, item.id)));
    return accounts;
};
exports.createOrUpdateAccounts = createOrUpdateAccounts;
const getAccounts = async (userId, institutionId) => {
    const accounts = await account_1.default.findAll({
        include: {
            model: item_1.default,
            where: { userId },
            include: [
                {
                    model: institution_1.default,
                    where: institutionId ? { id: institutionId } : {},
                    attributes: { exclude: ['createdAt', 'updatedAt', 'mask'] },
                },
            ],
            attributes: ['id', 'status', 'consentExpirationTime', 'lastSynced'],
        },
    });
    return accounts;
};
exports.getAccounts = getAccounts;
const deleteAccount = async (accountId) => {
    const deleted = account_1.default.destroy({
        where: { id: accountId },
    });
    return deleted;
};
exports.deleteAccount = deleteAccount;
const getAccountsWithStats = async (userId, monthKey) => {
    const accounts = await db_1.sequelize.query(`
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
  `, { type: sequelize_1.QueryTypes.SELECT });
    const updAccounts = accounts.map((acc) => ({
        ...acc,
        institutionLogo: acc.institutionLogo.toString('base64'),
    }));
    return updAccounts;
};
exports.getAccountsWithStats = getAccountsWithStats;
