"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calendar = exports.PlaidCategory = exports.Category = exports.Transaction = exports.Account = exports.Institution = exports.Item = exports.Session = exports.User = void 0;
/* eslint-disable import/no-cycle */
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const session_1 = __importDefault(require("./session"));
exports.Session = session_1.default;
const item_1 = __importDefault(require("./item"));
exports.Item = item_1.default;
const institution_1 = __importDefault(require("./institution"));
exports.Institution = institution_1.default;
const account_1 = __importDefault(require("./account"));
exports.Account = account_1.default;
const transaction_1 = __importDefault(require("./transaction"));
exports.Transaction = transaction_1.default;
const plaidCategory_1 = __importDefault(require("./plaidCategory"));
exports.PlaidCategory = plaidCategory_1.default;
const category_1 = __importDefault(require("./category"));
exports.Category = category_1.default;
const calendar_1 = __importDefault(require("./calendar"));
exports.Calendar = calendar_1.default;
const authToken_1 = __importDefault(require("./authToken"));
user_1.default.hasMany(item_1.default);
item_1.default.belongsTo(user_1.default);
institution_1.default.hasMany(item_1.default);
item_1.default.belongsTo(institution_1.default);
account_1.default.belongsTo(item_1.default);
item_1.default.hasMany(account_1.default);
account_1.default.hasMany(transaction_1.default);
transaction_1.default.belongsTo(account_1.default);
plaidCategory_1.default.hasMany(transaction_1.default);
transaction_1.default.belongsTo(plaidCategory_1.default);
category_1.default.hasMany(transaction_1.default);
transaction_1.default.belongsTo(category_1.default);
category_1.default.hasMany(transaction_1.default, { foreignKey: 'ogCategoryId' });
category_1.default.hasMany(plaidCategory_1.default);
plaidCategory_1.default.belongsTo(category_1.default);
user_1.default.hasMany(category_1.default);
category_1.default.belongsTo(user_1.default);
calendar_1.default.hasMany(transaction_1.default);
transaction_1.default.belongsTo(calendar_1.default);
calendar_1.default.hasMany(transaction_1.default);
transaction_1.default.belongsTo(calendar_1.default);
user_1.default.hasMany(authToken_1.default);
authToken_1.default.belongsTo(user_1.default);