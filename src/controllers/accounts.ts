import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import { getAccountsByUserId } from '../models/account';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorize');

  // const item = await getItemByUserId(req.user.id);
  // if(!item) throw Error('User has no items');

  const accounts = await getAccountsByUserId(req.user.id);
  res.json(accounts);
});

export default router;
