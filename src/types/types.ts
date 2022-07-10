/* eslint-disable import/no-cycle */
import { InferAttributes, WhereOptions } from 'sequelize/types';
import { Account, Calendar, Category, Transaction } from '../models';

export type TransactionsWhereClause =
  | WhereOptions<
      InferAttributes<
        Transaction,
        {
          omit: never;
        }
      >
    >
  | undefined;

export type CalendarWhereClause =
  | WhereOptions<
      InferAttributes<
        Calendar,
        {
          omit: never;
        }
      >
    >
  | undefined;

export type CreateCategoryReq = {
  name: string;
  iconName: string;
  iconColor: string;
  exclude: boolean;
};

export type AccountWhereClause =
  | WhereOptions<
      InferAttributes<
        Account,
        {
          omit: never;
        }
      >
    >
  | undefined;

export type CategoryWhereClause =
  | WhereOptions<
      InferAttributes<
        Category,
        {
          omit: never;
        }
      >
    >
  | undefined;

export interface GetSpendingByCategoryOptions {
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
  categoryIds?: number[];
  removeZeroCounts?: boolean;
}

export enum ExcludedTransactionsFilter {
  ONLY_EXCLUDED,
  ONLY_INCLUDED,
  ALL,
}

export interface GetTransactionsOptions {
  offset?: number;
  limit?: number;
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
  categoryIds?: number[];
  orderBy?: string;
  excludedTransactions?: ExcludedTransactionsFilter;
}

export interface GetTransactionsSummaryOptions {
  startDate?: Date;
  endDate?: Date;
}

export interface GetTopExpensesOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface GetTopMerchantsOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface EcludeTransactionReq {
  transactionId: number;
  exclude: boolean;
}

export interface EcludeCategoryReq {
  categoryId: number;
  exclude: boolean;
}
