/* eslint-disable max-classes-per-file */

import { AuthErrorName, ErrorType, PlaidErrorName } from './types';

export class AuthError extends Error {
  statusCode = 401;

  type = ErrorType.AUTH_ERROR;

  constructor(message: string, name: AuthErrorName) {
    super(message);

    Object.setPrototypeOf(this, AuthError.prototype);
    this.name = name;
  }
}

export class PlaidError extends Error {
  statusCode = 400;

  type = ErrorType.PLAID_ERROR;

  constructor(message: string, name: PlaidErrorName) {
    super(message);

    Object.setPrototypeOf(this, AuthError.prototype);
    this.name = name;
  }
}

export class BadApiRequest extends Error {
  statusCode = 404;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
