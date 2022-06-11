import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactionsByAccountAndUser,
  getTransactionsByUserId,
} from '../models/transaction';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  const transactions = await getTransactionsByUserId(req.user.id);
  res.json(transactions);
});

router.get('/account/:accountId', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  const transactions = await getTransactionsByAccountAndUser(
    Number(req.params.accountId),
    req.user.id,
  );
  res.json(transactions);
});

export default router;
