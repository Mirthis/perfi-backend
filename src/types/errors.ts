/* eslint-disable max-classes-per-file */

import { AuthErrorName } from './types';

export class AuthError extends Error {
  statusCode = 401;

  constructor(message: string, name: AuthErrorName) {
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
