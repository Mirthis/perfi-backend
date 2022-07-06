import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactions,
  getSpendingByCategory,
  getTransactionsSummary,
  getTopMerchants,
} from '../models/transaction-queries';
import {
  GetSpendingByCategoryOptions,
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

router.get('/spending_summary_category', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');
  const queryOptions: GetSpendingByCategoryOptions = { ...req.query };

  // TODO: create proper parsing function for inputs
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
  // if (
  //   req.query.startDate &&
  //   (typeof req.query.startDate === 'string' ||
  //     req.query.startDate instanceof String)
  // ) {
  //   queryOptions.startDate = new Date(req.query.startDate as string);
  // }
  // if (
  //   req.query.endDate &&
  //   (typeof req.query.endDate === 'string' ||
  //     req.query.endDate instanceof String)
  // ) {
  //   queryOptions.endDate = new Date(req.query.endDate as string);
  // }

  const transactions = await getSpendingByCategory(req.user.id, queryOptions);
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

  const transactions = await getTransactionsSummary(req.user.id, req.query);
  res.json(transactions);
});

router.get('/top_merchants', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');

  const topMerchants = await getTopMerchants(req.user.id, req.query);
  res.json(topMerchants);
});

// router.get('/top_expenses', isAuthenticated, async (req, res) => {
//   if (!req.user) throw Error('Unauthorized');

//   const topExpenses = await getTopExpenses(req.user.id, req.query);
//   res.json(topExpenses);
// });

export default router;
