"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isAuthenticated = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const morgan_1 = __importDefault(require("morgan"));
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("./logger"));
const errors_1 = require("../types/errors");
const types_1 = require("../types/types");
const unknownEndpoint = (_request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
const errorHandler = (error, _req, res, _next) => {
    console.log('Error midleware');
    // const returnMessageName = [
    //   'SequelizeValidationError',
    //   'SequelizeUniqueConstraintError',
    // ];
    logger_1.default.error('Error: ', error);
    logger_1.default.error('Error message: ', error.message);
    logger_1.default.error('Error name: ', error.name);
    if (error instanceof errors_1.AuthError || error instanceof errors_1.PlaidError) {
        logger_1.default.error('Auth error identified');
        res.status(error.statusCode).json({
            message: error.message,
            name: error.name,
            type: error.type,
        });
    }
    else if (error instanceof sequelize_1.ValidationError) {
        const errors = error.errors.map((e) => ({
            type: e.type,
            message: e.message,
            path: e.path,
        }));
        res
            .status(400)
            .json({ type: types_1.ErrorType.VALIDATION_ERROR, name: error.name, errors });
    }
    else {
        res.status(400).json({ type: types_1.ErrorType.GENERIC_ERROR });
    }
    // _next(error);
};
morgan_1.default.token('body', (request) => {
    const data = request.body;
    return JSON.stringify(data);
});
const isAuthenticated = (req, _res, next) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        if (!user.isActive) {
            throw new errors_1.AuthError('User is not active', types_1.AuthErrorName.USER_INACTIVE);
        }
        if (!user.isVerified) {
            throw new errors_1.AuthError('User is not verified', types_1.AuthErrorName.USER_NOT_VERIFIED);
        }
        return next();
    }
    throw new errors_1.AuthError('Unauthorized', types_1.AuthErrorName.USER_UNAUTHORIZED);
};
exports.isAuthenticated = isAuthenticated;
const isUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(404).json('Unauthorized');
};
exports.isUser = isUser;
exports.default = {
    unknownEndpoint,
    errorHandler,
    morgan: morgan_1.default,
    isAuthenticated: exports.isAuthenticated,
};
