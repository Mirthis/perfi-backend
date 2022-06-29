import { Op } from 'sequelize';
import Category from './category';

export const getUserCategories = async (userId: number) => {
  const categories = Category.findAll({
    where: { userId: { [Op.in]: [userId, -1] } },
    order: ['name'],
  });
  return categories;
};

export const addCategories = async (userId: number) => {
  console.log(userId);
};
