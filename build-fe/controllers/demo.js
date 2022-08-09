"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const crypto_1 = __importDefault(require("crypto"));
const models_1 = require("../models");
const db_1 = require("../utils/db");
const router = express_1.default.Router();
router.get('/ping', async (_req, res) => {
    res.json('pong!');
});
router.post('/create', async (req, res) => {
    const result = await db_1.sequelize.query('SELECT max(id) as "maxId" from users;', {
        type: sequelize_1.QueryTypes.SELECT,
    });
    const demoAccountId = result[0].maxId + 1;
    const email = `demo${demoAccountId}@perfiapp.io`;
    const password = `Dem0!${crypto_1.default.randomBytes(5).toString('hex')}`;
    const user = await models_1.User.create({
        email,
        password,
        isActive: true,
        isVerified: true,
    });
    const sourceItem = await models_1.Item.findAll({
        include: [
            { model: models_1.User, where: { email: 'sample@perfiapp.io' } },
            { model: models_1.Account, include: [{ model: models_1.Transaction }] },
        ],
    });
    sourceItem.forEach(async (item) => {
        const newItem = await models_1.Item.create({
            ...item.toJSON(),
            userId: user.id,
            plaidItemId: `N/A - ${user.email} - ${item.plaidItemId}`,
            accessToken: `N/A - ${user.email} - ${item.accessToken}`,
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined,
        });
        item?.accounts.forEach(async (account) => {
            const newAccount = await models_1.Account.create({
                ...account.toJSON(),
                itemId: newItem.id,
                plaidAccountId: `N/A - ${user.email} - ${account.plaidAccountId}`,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
            });
            account.transactions.forEach(async (tx) => {
                await models_1.Transaction.create({
                    ...tx.toJSON(),
                    plaidTransactionId: `N/A - ${user.email} - ${tx.plaidTransactionId}`,
                    accountId: newAccount.id,
                    id: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                });
            });
        });
    });
    req.logIn(user, (err) => {
        if (err) {
            console.log(err);
        }
        res.status(200).json({ id: user.id, email: user.email });
    });
});
exports.default = router;
