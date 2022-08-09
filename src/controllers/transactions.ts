import express from 'express';
import sequelize from 'sequelize';
import { isAuthenticated } from '../utils/middleware';
import {
  getTransactions,
  getTopMerchants,
  setTransactionExcludeFlag,
  setTransactionCategory,
  getSimilarTransactions,
  setSimilarTransactionsCategory,
  getTransaction,
  getSimilarTransactionsCount,
  getSpending,
  getCumulativeSpending,
} from '../models/transaction-queries';
import {
  AccountSummary,
  EcludeTransactionReq,
  GetCumulativeSpendingOptions,
  GetSpendingByOptions,
  GetTransactionsOptions,
  SetTransactionCategoryReq,
} from '../types/types';
import {
  parseBoolean,
  parseDate,
  parseNumber,
  parseNumbersArray,
} from '../utils/requestParamParser';
import { getDates } from '../models/calendar';

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

const toSpendingByOptions = ({
  accountIds,
  startDate,
  refDate,
  endDate,
  categoryIds,
  removeZeroCounts,
}: {
  accountIds?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  refDate?: unknown;
  categoryIds?: unknown;
  removeZeroCounts?: unknown;
}) => {
  const requestParams: GetSpendingByOptions = {};

  if (accountIds !== undefined) {
    requestParams.categoryIds = parseNumbersArray(accountIds, 'accountIds');
  }

  if (startDate !== undefined) {
    requestParams.startDate = new Date(parseDate(startDate, 'startDate'));
  }

  if (endDate !== undefined) {
    requestParams.endDate = new Date(parseDate(endDate, 'endDate'));
  }

  if (refDate !== undefined) {
    requestParams.refDate = new Date(parseDate(refDate, 'refMonth'));
  }

  if (categoryIds !== undefined) {
    requestParams.categoryIds = parseNumbersArray(categoryIds, 'categoryIds');
  }

  if (removeZeroCounts !== undefined) {
    requestParams.removeZeroCounts = Boolean(removeZeroCounts);
  }
  return requestParams;
};

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

router.get('/top_merchants', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');

  const topMerchants = await getTopMerchants(req.user.id, req.query);
  res.json(topMerchants);
});

router.post('/exclude/', isAuthenticated, async (req, res) => {
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

router.get('/similar_count', async (req, res) => {
  if (!req.query.transactionId) {
    throw Error('Invalid parameter transactionId');
  }
  const txCount = await getSimilarTransactionsCount(
    req.user!.id,
    Number(req.query.transactionId),
  );
  if (!txCount) {
    res.status(400).json('transaction not found');
  } else {
    res.json(txCount[0]);
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

router.get('/id/:transactionId', isAuthenticated, async (req, res) => {
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

router.get('/spending', isAuthenticated, async (req, res) => {
  const queryParams = toSpendingByOptions(req.query);
  queryParams.aggregateBy = ['calendar.year', 'calendar.month'];
  const transactions = await getSpending(req.user!.id, queryParams);
  res.json(transactions);
});

router.get('/spending/bycategory/', isAuthenticated, async (req, res) => {
  const queryParams = toSpendingByOptions(req.query);
  queryParams.aggregateBy = [
    'calendar.year',
    'calendar.month',
    'category.id',
    'category.name',
    'category.iconName',
    'category.iconColor',
    'category.exclude',
  ];
  const spending = await getSpending(req.user!.id, queryParams);
  res.json(spending);
});

router.get('/spending/byaccount/', isAuthenticated, async (req, res) => {
  const queryParams = toSpendingByOptions(req.query);
  queryParams.aggregateBy = [
    'calendar.year',
    'calendar.month',
    'account.id',
    'account.name',
    'account.officialName',
    'account.type',
    'account.subType',
    'account.currentBalance',
    'account.availableBalance',
    'account.isoCurrencyCode',
    [sequelize.col('account->item->institution.name'), 'institutionName'],
    [sequelize.col('account->item->institution.color'), 'institutionColor'],
    [sequelize.col('account->item->institution.logo'), 'institutionLogo'],
  ];

  // @ts-ignore
  const accounts = (await getSpending(
    req.user!.id,
    queryParams,
  )) as AccountSummary[];


  const cleansedAccount = accounts.map((i) => ({
    ...i,
    institutionLogo: i.institutionLogo.toString('base64'),
  }));

  res.json(cleansedAccount);
});

router.get(
  '/spending/compare/bycategory',
  isAuthenticated,
  async (req, res) => {
    const refDate = parseDate(req.query.refDate, 'refDate');
    const dates = await getDates(new Date(refDate));

    if (!dates) {
      throw Error('Something went wrong');
    }

    const options: GetSpendingByOptions = {
      aggregateBy: [
        'calendar.year',
        'calendar.month',
        'category.id',
        'category.name',
        'category.iconName',
        'category.iconColor',
        'category.exclude',
      ],
      removeZeroCounts: true,
    };

    options.startDate = dates.curr_month_start_date;
    options.endDate = dates.curr_month_end_date;

    const cmValues = await getSpending(req.user!.id, options);

    options.startDate = dates.prev_month_start_date;
    options.endDate = dates.prev_month_end_date;

    const pmValues = await getSpending(req.user!.id, options);

    res.json({ cmValues, pmValues });
  },
);

router.get(
  '/spending/compare/cumulative',
  isAuthenticated,
  async (req, res) => {
    const refDate = parseDate(req.query.refDate, 'refDate');
    const dates = await getDates(new Date(refDate));

    if (!dates) {
      throw Error('Something went wrong');
    }

    const options: GetCumulativeSpendingOptions = {
      startDate: dates.curr_month_start_date,
      endDate: dates.curr_month_end_date,
    };

    const cmValues = await getCumulativeSpending(req.user!.id, options);

    options.startDate = dates.prev_month_start_date;
    options.endDate = dates.prev_month_end_date;

    const pmValues = await getCumulativeSpending(req.user!.id, options);

    options.startDate = dates.prev_12_month_start_date;
    options.endDate = dates.prev_12_month_end_date;

    const p12Values = await getCumulativeSpending(req.user!.id, options);

    res.json({ cmValues, pmValues, p12Values });
  },
);

export default router;
