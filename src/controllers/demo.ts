/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { QueryTypes } from 'sequelize';
import crypto from 'crypto';
import { Account, Item, User, Transaction } from '../models';
import { sequelize } from '../utils/db';

const router = express.Router();

router.get('/ping', async (_req, res) => {
  res.json('pong!');
});

router.post('/create', async (req, res) => {
  const result = await sequelize.query<{ maxId: number }>(
    'SELECT max(id) as "maxId" from users;',
    {
      type: QueryTypes.SELECT,
    },
  );
  const demoAccountId = result[0].maxId + 1;
  const email = `demo${demoAccountId}@perfiapp.io`;
  const password = `Dem0!${crypto.randomBytes(5).toString('hex')}`;

  const user = await User.create({
    email,
    password,
    isActive: true,
    isVerified: true,
  });

  const sourceItem = await Item.findAll({
    include: [
      { model: User, where: { email: 'sample@perfiapp.io' } },
      { model: Account, include: [{ model: Transaction }] },
    ],
  });

  sourceItem.forEach(async (item) => {
    const newItem = await Item.create({
      ...item.toJSON(),
      userId: user.id,
      plaidItemId: `N/A - ${user.email} - ${item.plaidItemId}`,
      accessToken: `N/A - ${user.email} - ${item.accessToken}`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });

    item?.accounts.forEach(async (account) => {
      const newAccount = await Account.create({
        ...account.toJSON(),
        itemId: newItem.id,
        plaidAccountId: `N/A - ${user.email} - ${account.plaidAccountId}`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });

      account.transactions.forEach(async (tx) => {
        await Transaction.create({
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

export default router;
