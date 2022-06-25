/* eslint-disable import/no-cycle */
import { InferAttributes, WhereOptions } from 'sequelize/types';
import { Account, Transaction } from '../models';

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

export interface GetCategoriesSummaryOptions {
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
}

export interface GetTransactionsOptions {
  offset?: number;
  limit?: number;
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
}
