import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactions,
  getSpendingByCategory,
  getTransactionsSummary,
  getTopMerchants,
  setTransactionExcludeFlag,
  setTransactionCategory,
  getSimilarTransactions,
  setSimilarTransactionsCategory,
  getTransaction,
} from '../models/transaction-queries';
import {
  EcludeTransactionReq,
  GetSpendingByCategoryOptions,
  GetTransactionsOptions,
  SetTransactionCategoryReq,
} from '../types/types';
import { parseBoolean, parseNumber } from '../utils/requestParamParser';

const router = express.Router();

const toExcludeTransactionReq = ({
  transactionId,
  exclude,
}: {
  transactionId: unknown;
  exclude: unknown;
}): EcludeTransactionReq => {
  const requestParameters = {
    transactionId: parseNumber(transactionId, 'transactionId'),
    exclude: parseBoolean(exclude, 'exclude'),
  };
  return requestParameters;
};

const toSetTransactionCategoryReq = ({
  transactionId,
  categoryId,
}: {
  transactionId: unknown;
  categoryId: unknown;
}): SetTransactionCategoryReq => {
  const requestParameters = {
    transactionId: parseNumber(transactionId, 'transactionId'),
    categoryId: parseNumber(categoryId, 'categoryId'),
  };
  return requestParameters;
};

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

  const transactions = await getSpendingByCategory(req.user.id, queryOptions);
  res.json(transactions);
});

// TODO: add proper parsing of input parameters for this and other requests
router.get('/', isAuthenticated, async (req, res) => {
  // TODO: remove check anduse Typescript |
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

router.get('/:transactionId', isAuthenticated, async (req, res) => {
  console.log(req.params);
  const transaction = await getTransaction(
    req.user!.id,
    Number(req.params.transactionId),
  );

  if (!transaction) {
    res.status(400).json('transaction not found');
  } else {
    res.json(transaction);
  }
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

router.post('/exclude/', isAuthenticated, async (req, res) => {
  console.log(req.body);
  const { transactionId, exclude } = toExcludeTransactionReq(req.body);

  const transaction = await setTransactionExcludeFlag(
    req.user!.id,
    transactionId,
    exclude,
  );
  if (!transaction) {
    res.status(400).json('transaction not found');
  } else {
    res.json(transaction);
  }
});

router.post('/category/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);

  const transaction = await setTransactionCategory(
    req.user.id,
    transactionId,
    categoryId,
  );
  if (!transaction) {
    res.status(400).json('transaction not found');
  } else {
    res.json(transaction);
  }
});

router.get('/find_similar', async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  if (!req.query.transactionId) {
    throw Error('Invalid parameter transactionId');
  }
  const transactions = await getSimilarTransactions(
    req.user.id,
    Number(req.query.transactionId),
  );
  if (!transactions) {
    res.status(400).json('transaction not found');
  } else {
    res.json(transactions);
  }
});

router.put('/update_category', async (req, res) => {
  const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);

  const transaction = await setTransactionCategory(
    req.user!.id,
    transactionId,
    categoryId,
  );

  if (!transaction) {
    res.status(400).json('transaction not found');
  } else {
    res.json(transaction);
  }
});

router.put('/update_category_similar', async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const { transactionId, categoryId } = toSetTransactionCategoryReq(req.body);

  const affected = await setSimilarTransactionsCategory(
    req.user.id,
    transactionId,
    categoryId,
  );

  if (!affected) {
    res.status(400).json('transaction not found');
  } else {
    res.json(affected);
  }
});

export default router;
