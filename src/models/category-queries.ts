import { Op, Sequelize } from 'sequelize';
import { CreateCategoryReq } from '../types/types';
import Category from './category';
import Transaction from './transaction';

export const getCategory = async (categoryId: number) => {
  const category = Category.findOne({ where: { id: categoryId } });
  return category;
};

export const getCategories = async (userId: number) => {
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

  await Transaction.update(
    { categoryId: Sequelize.literal('"ogCategoryId"') },
    { where: { categoryId } },
  );

  await category.destroy();
  return true;
};

export const updateCategory = async (
  userId: number,
  categoryId: number,
  categoryData: CreateCategoryReq,
) => {
  const category = await getCategory(categoryId);
  if (!category || category.userId !== userId) {
    return false;
  }
  category.name = categoryData.name;
  category.iconColor = categoryData.iconColor;
  category.iconName = categoryData.iconName;
  category.exclude = categoryData.exclude;
  await category.save();
  return category;
};
