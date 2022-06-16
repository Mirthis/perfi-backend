import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactionsByUserId,
  getAccountTransactionsSummary,
  getTransactions,
} from '../models/transaction-queries';
import { getErrorMessage } from '../utils/logger';
import { getCategoriesSummary } from '../models/category-queries';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  const transactions = await getTransactionsByUserId(req.user.id);
  res.json(transactions);
});

router.get('/categorySummary', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  try {
    const transactions = await getCategoriesSummary(req.user.id);
    res.json(transactions);
  } catch (err: unknown) {
    console.error(`Error fetching transactions: ${getErrorMessage(err)}`);
  }
});

router.get('/account/:accountId', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');
  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  // const transactions = await getTransactionsByAccount(
  //   Number(req.params.accountId),
  //   req.user.id,
  //   req.body,
  // );
  const transactions = await getTransactions(req.user.id, req.body);
  res.json(transactions);
});

router.get('/account/:accountId/summary', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');
  console.log(req.body);
  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  const transactions = await getAccountTransactionsSummary(
    Number(req.params.accountId),
    req.user.id,
  );
  res.json(transactions);
});

export default router;
