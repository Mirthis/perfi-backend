"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoRouter = exports.categoriesRouter = exports.accountsRouter = exports.transactionsRouter = exports.usersRouter = exports.plaidRouter = exports.authRouter = void 0;
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRouter", { enumerable: true, get: function () { return __importDefault(auth_1).default; } });
var plaid_1 = require("./plaid");
Object.defineProperty(exports, "plaidRouter", { enumerable: true, get: function () { return __importDefault(plaid_1).default; } });
var users_1 = require("./users");
Object.defineProperty(exports, "usersRouter", { enumerable: true, get: function () { return __importDefault(users_1).default; } });
var transactions_1 = require("./transactions");
Object.defineProperty(exports, "transactionsRouter", { enumerable: true, get: function () { return __importDefault(transactions_1).default; } });
var accounts_1 = require("./accounts");
Object.defineProperty(exports, "accountsRouter", { enumerable: true, get: function () { return __importDefault(accounts_1).default; } });
var categories_1 = require("./categories");
Object.defineProperty(exports, "categoriesRouter", { enumerable: true, get: function () { return __importDefault(categories_1).default; } });
var demo_1 = require("./demo");
Object.defineProperty(exports, "demoRouter", { enumerable: true, get: function () { return __importDefault(demo_1).default; } });
