import express from 'express';
import { isAuthenticated } from '../utils/middleware';
import {
  createCategory,
  deleteCategory,
  getCategories,
  setCategoryExcludeFlag,
  updateCategory,
} from '../models/category-queries';
import { CreateCategoryReq, EcludeCategoryReq } from '../types/types';
import { parseBoolean, parseString } from '../utils/requestParamParser';

const router = express.Router();

const toExcludeCategoryReq = ({
  exclude,
}: {
  exclude: unknown;
}): EcludeCategoryReq => {
  const requestParameters = {
    exclude: parseBoolean(exclude, 'exclude'),
  };
  return requestParameters;
};

// const toDeleteCategoryReq = ({
//   categoryId,
// }: {
//   categoryId: unknown;
// }): DeleteCategoryReq => {
//   const requestParameters = {
//     categoryId: parseNumber(categoryId, 'categoryId'),
//   };
//   return requestParameters;
// };

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

  const categories = await getCategories(req.user.id);
  res.json(categories);
});

router.put('/:categoryId/exclude/', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const { exclude } = toExcludeCategoryReq(req.body);

  const category = await setCategoryExcludeFlag(
    req.user.id,
    Number(req.params.categoryId),
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

router.put('/:categoryId/update', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const createCategoryParams = toCreateCategoryReq(req.body);
  const newCategory = await updateCategory(
    req.user.id,
    Number(req.params.categoryId),
    createCategoryParams,
  );
  if (!newCategory) {
    res.status(400).json('category not found');
  } else {
    res.json(newCategory);
  }
});

router.delete('/:categoryId/delete', isAuthenticated, async (req, res) => {
  if (!req.user) throw Error('Unauthorized');
  const result = await deleteCategory(
    req.user.id,
    Number(req.params.categoryId),
  );
  if (!result) {
    res.status(400).json('category not found');
  } else {
    res.json();
  }
});

export default router;
