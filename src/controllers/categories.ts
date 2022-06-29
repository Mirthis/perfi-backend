import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import { getUserCategories } from '../models/category-queries';

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');

  const categories = await getUserCategories(req.user.id);
  res.json(categories);
});

export default router;
