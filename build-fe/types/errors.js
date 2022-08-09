"use strict";
/* eslint-disable max-classes-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadApiRequest = exports.PlaidError = exports.AuthError = void 0;
const types_1 = require("./types");
class AuthError extends Error {
    constructor(message, name) {
        super(message);
        this.statusCode = 401;
        this.type = types_1.ErrorType.AUTH_ERROR;
        Object.setPrototypeOf(this, AuthError.prototype);
        this.name = name;
    }
}
exports.AuthError = AuthError;
class PlaidError extends Error {
    constructor(message, name) {
        super(message);
        this.statusCode = 400;
        this.type = types_1.ErrorType.PLAID_ERROR;
        Object.setPrototypeOf(this, AuthError.prototype);
        this.name = name;
    }
}
exports.PlaidError = PlaidError;
class BadApiRequest extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}
exports.BadApiRequest = BadApiRequest;
