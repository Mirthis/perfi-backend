import { Op } from 'sequelize';
import { CreateCategoryReq } from '../types/types';
import Category from './category';

export const getCategory = async (categoryId: number) => {
  const category = Category.findOne({ where: { id: categoryId } });
  return category;
};

export const getUserCategories = async (userId: number) => {
  const categories = Category.findAll({
    where: { userId: { [Op.in]: [userId, -1] } },
    order: ['name'],
  });
  return categories;
};

export const createCategory = async (
  userId: number,
  categoryData: CreateCategoryReq,
) => {
  const newCategoryData = { ...categoryData, userId };
  const newCategory = await Category.create(newCategoryData);
  return newCategory;
};

export const setCategoryExcludeFlag = async (
  userId: number,
  categoryId: number,
  exclude: boolean,
) => {
  console.log(categoryId);
  const category = await getCategory(categoryId);
  if (!category || category.userId !== userId) {
    return null;
  }
  category.exclude = exclude;
  await category.save();
  return category;
};

export const deleteCategory = async (userId: number, categoryId: number) => {
  const category = await getCategory(categoryId);
  if (!category || category.userId !== userId) {
    return false;
  }

  await category.destroy();
  return true;
};
