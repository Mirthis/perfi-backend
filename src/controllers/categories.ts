import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  createCategory,
  getUserCategories,
  setCategoryExcludeFlag,
} from '../models/category-queries';
import { CreateCategoryReq, EcludeCategoryReq } from '../types/types';
import {
  parseBoolean,
  parseNumber,
  parseString,
} from '../utils/requestParamParser';

const router = express.Router();

const toExcludeCategoryReq = ({
  categoryId,
  exclude,
}: {
  categoryId: unknown;
  exclude: unknown;
}): EcludeCategoryReq => {
  const requestParameters = {
    categoryId: parseNumber(categoryId, 'categoryId'),
    exclude: parseBoolean(exclude, 'exclude'),
  };
  return requestParameters;
};

const toCreateCategoryReq = ({
  name,
  iconName,
  iconColor,
  exclude,
}: {
  name: unknown;
  iconName: unknown;
  iconColor: unknown;
  exclude: unknown;
}): CreateCategoryReq => {
  const requestParameters = {
    name: parseString(name, 'categoryId'),
    iconName: parseString(iconName, 'categoryId'),
    iconColor: parseString(iconColor, 'categoryId'),
    exclude: parseBoolean(exclude, 'exclude'),
  };
  return requestParameters;
};

router.get('/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');

  const categories = await getUserCategories(req.user.id);
  res.json(categories);
});

router.post('/exclude/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const { categoryId, exclude } = toExcludeCategoryReq(req.body);

  const category = await setCategoryExcludeFlag(
    req.user.id,
    categoryId,
    exclude,
  );
  if (!category) {
    res.status(400).json('category not found');
  } else {
    res.json(category);
  }
});

router.post('/create', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const createCategoryParams = toCreateCategoryReq(req.body);
  const newCategory = await createCategory(req.user.id, createCategoryParams);
  res.json(newCategory);
});

export default router;
