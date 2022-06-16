import { Op } from 'sequelize';
import { AccountWhereClause, TransactionsWhereClause } from '../types/types';
import Category from './category';
import Transaction from './transaction';
import { sequelize } from '../utils/db';
import Item from './item';
import Account from './account';

interface GetCategoriesSummaryOptions {
  offset?: number;
  limit?: number;
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export const getCategoriesSummary = (
  userId: number,
  options?: GetCategoriesSummaryOptions,
) => {
  const transactionWhere: TransactionsWhereClause = {};
  const accountWhere: AccountWhereClause = {};

  const startDate = options?.startDate;
  const endDate = options?.endDate;
  const accountIds = options?.accountIds;

  if (startDate && endDate) {
    transactionWhere.transactionDate = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    transactionWhere.transactionDate = { [Op.gte]: startDate };
  } else if (endDate) {
    transactionWhere.transactionDate = { [Op.lte]: endDate };
  }

  if (accountIds) {
    accountWhere.id = { [Op.in]: accountIds };
  }

  const categorySummary = Category.findAll({
    attributes: ['category.name'],
    include: [
      {
        model: Transaction,
        required: true,
        attributes: [
          [sequelize.fn('sum', sequelize.col('amount')), 'amountSum'],
        ],
        include: [
          {
            model: Account,
            where: accountWhere,
            include: [{ model: Item, where: { userId }, attributes: [] }],
            attributes: [],
          },
        ],
      },
    ],
    group: ['transaction.ame'],
    raw: true,
  });

  return categorySummary;
};

export const getCategories = (userId: number) => {
  console.log(userId);
};
