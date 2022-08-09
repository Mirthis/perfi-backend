"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../utils/middleware");
const account_queries_1 = require("../models/account-queries");
const requestParamParser_1 = require("../utils/requestParamParser");
const router = express_1.default.Router();
router.get('/', middleware_1.isAuthenticated, async (req, res) => {
    const accounts = await (0, account_queries_1.getAccounts)(req.user.id);
    res.json(accounts);
});
router.get('/with_stats', middleware_1.isAuthenticated, async (req, res) => {
    const monthKey = (0, requestParamParser_1.parseString)(req.query.monthKey, 'momthKey');
    const accounts = await (0, account_queries_1.getAccountsWithStats)(req.user.id, monthKey);
    res.json(accounts);
});
exports.default = router;
