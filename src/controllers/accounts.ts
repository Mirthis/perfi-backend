import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import { getAccounts, getAccountsWithStats } from '../models/account';
import { parseString } from '../utils/requestParamParser';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  const accounts = await getAccounts(req.user!.id);
  res.json(accounts);
});

router.get('/with_stats', isAuthenticated, async (req, res) => {
  const monthKey = parseString(req.query.monthKey, 'momthKey');

  const accounts = await getAccountsWithStats(req.user!.id, monthKey);
  res.json(accounts);
});

export default router;
