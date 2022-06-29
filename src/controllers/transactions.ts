import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactions,
  getTransactionsCategorySummary,
  getTransactionsSummary,
} from '../models/transaction-queries';
import {
  GetCategoriesSummaryOptions,
  GetTransactionsOptions,
} from '../types/types';

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
  const queryOptions: GetCategoriesSummaryOptions = { ...req.query };
  if (
    req.query.accountIds &&
    (typeof req.query.accountIds === 'string' ||
      req.query.accountIds instanceof String)
  ) {
    queryOptions.accountIds = req.query.accountIds
      .split(',')
      .map((i) => Number(i));
  }
  if (
    req.query.categoryIds &&
    (typeof req.query.categoryIds === 'string' ||
      req.query.categoryIds instanceof String)
  ) {
    queryOptions.categoryIds = req.query.categoryIds
      .split(',')
      .map((i) => Number(i));
  }
  const transactions = await getTransactionsCategorySummary(
    req.user.id,
    queryOptions,
  );
  res.json(transactions);
});

// TODO: add proper parsing of input parameters for this and other requests
router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const queryOptions: GetTransactionsOptions = { ...req.query };
  if (
    req.query.accountIds &&
    (typeof req.query.accountIds === 'string' ||
      req.query.accountIds instanceof String)
  ) {
    queryOptions.accountIds = req.query.accountIds
      .split(',')
      .map((i) => Number(i));
  }
  if (
    req.query.categoryIds &&
    (typeof req.query.categoryIds === 'string' ||
      req.query.categoryIds instanceof String)
  ) {
    queryOptions.categoryIds = req.query.categoryIds
      .split(',')
      .map((i) => Number(i));
  }

  const transactions = await getTransactions(req.user.id, queryOptions);
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
