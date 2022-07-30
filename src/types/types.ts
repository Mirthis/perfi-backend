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

export type DeleteCategoryReq = {
  categoryId: number;
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

export interface GetSpendingByOptions {
  accountIds?: number[];
  startDate?: Date;
  endDate?: Date;
  refDate?: Date;
  categoryIds?: number[];
  removeZeroCounts?: boolean;
  aggregateBy?: string[];
}

export interface GetCumulativeSpendingOptions {
  startDate: Date;
  endDate: Date;
}

export enum ExcludedTransactionsFilter {
  ONLY_EXCLUDED,
  ONLY_INCLUDED,
  ALL,
}

export enum AuthTokenType {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
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
  onlyPositiveAmounts?: boolean;
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

export interface SetTransactionCategoryReq {
  transactionId: number;
  categoryId: number;
}

export interface GetSimilarTransactionsReq {
  transactionId: number;
}

export interface EcludeCategoryReq {
  exclude: boolean;
}

export type AccountsWithStats = {
  id: number;
  name: string;
  officialName: string;
  type: string;
  subType: string;
  currentBalance: string;
  isoCurrencyCode: string;
  institutionId: number;
  institutionName: string;
  institutionColor: string;
  institutionLogo: Buffer;
  currMonthAmount: string;
  prevMonthAmount: string;
  currYearAmount: string;
};

export enum ErrorType {
  AUTH_ERROR = 'AuthError',
  VALIDATION_ERROR = 'ValidationError',
  GENERIC_ERROR = 'GenericError',
}

export enum AuthErrorName {
  USER_ALREADY_VERIFIED = 'UserAlreadyVerified',
  USER_INACTIVE = 'UserInactive',
  USER_CREDENTIALS_NOT_FOUND = 'UserCredentialsNotFound',
  USER_EMAIL_NOT_FOUND = 'UserEmailNotFound',
  USER_NOT_VERIFIED = 'UserNotVerified',
  USER_UNAUTHORIZED = 'UserUnauthorized',
  VERIFY_EMAIL_TOKEN_NOT_FOUND = 'VerifyEmailTokenNotFound',
  VERIFY_EMAIL_TOKEN_EXPIRED = 'VerifyEmailTokenExpired',
  VERIFY_PASSWORD_TOKEN_NOT_FOUND = 'VerifyPasswordTokenNotFound',
  VERIFY_PASSWORD_TOKEN_EXPIRED = 'VerifyPasswordTokenExpired',
}

export enum AggregateSpendBy {
  DAY = 'day',
  MONTH = 'month',
  CATEGORY = 'category',
}

// enum ApiErrorType {
//   AUTH = 'auth',
//   VALIDATION = 'validation',
//   GENERIC = 'generic',
// }

// enum AuthErrorCodes {
//   USER_NOT_VERIFIED,
//   USER_NOT_ACTIVE,
//   USER_NOT_FOUND,
// }

// enum GenericErrorCodes {
//   USER_NOT_VERIFIED,
//   USER_NOT_ACTIVE,
//   USER_NOT_FOUND,
// }

// export interface ApiError {
//   type: ApiErrorType;
//   code: number;
//   message: string;
// }

// export interface AuthError extends ApiError {
//   type: ApiErrorType.AUTH;
//   code: AuthErrorCodes;
// }

// export interface GenericError extends ApiError {
//   type: ApiErrorType.GENERIC;
//   code: GenericErrorCodes;
// }
