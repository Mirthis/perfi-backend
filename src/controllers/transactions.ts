import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactions,
  getTransactionsCategorySummary,
  getTransactionsSummary,
} from '../models/transaction-queries';

const router = express.Router();

// router.get('/', isAuthenticated, async (req, res) => {
//   if (!req.user) throw Error('Unauthorize');

//   // const item = await getItemByUserId(req.user.id);
//   // if(!item) throw Error('User has no items');

//   const transactions = await getTransactionsByUserId(req.user.id);
//   res.json(transactions);///
// });

router.get('/category_summary', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');
  // TODO: check why default error middleware is not working
  const transactions = await getTransactionsCategorySummary(
    req.user.id,
    req.query,
  );
  res.json(transactions);
});

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const transactions = await getTransactions(req.user.id, req.query);
  res.json(transactions);
});

router.get('/transactions_summary', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');

  // TODO: check why default error middleware is not working

  const transactions = await getTransactionsSummary(req.user.id);
  res.json(transactions);
});

// router.get('/account/:accountId', isAuthenticated, async (req, res) => {
//   if (!req.user) throw Error('Unauthorize');
//   // const item = await getItemByUserId(req.user.id);
//   // if(!item) throw Error('User has no items');

//   // const transactions = await getTransactionsByAccount(
//   //   Number(req.params.accountId),
//   //   req.user.id,
//   //   req.body,
//   // );
//   const transactions = await getTransactions(req.user.id, req.body);
//   res.json(transactions);
// });

// router.get('/account/:accountId/summary', isAuthenticated, async (req, res) => {
//   if (!req.user) throw Error('Unauthorize');
//   console.log(req.body);
//   // const item = await getItemByUserId(req.user.id);
//   // if(!item) throw Error('User has no items');

//   const transactions = await getAccountTransactionsSummary(
//     Number(req.params.accountId),
//     req.user.id,
//   );
//   res.json(transactions);
// });

export default router;
