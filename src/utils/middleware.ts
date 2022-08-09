/* eslint-disable @typescript-eslint/no-unused-vars */
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import logger from './logger';
import { User } from '../models';
import { AuthError, PlaidError } from '../types/errors';
import { AuthErrorName, ErrorType } from '../types/types';

const unknownEndpoint = (_request: Request, response: Response): void => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.log('Error midleware');
  // const returnMessageName = [
  //   'SequelizeValidationError',
  //   'SequelizeUniqueConstraintError',
  // ];
  logger.error('Error: ', error);
  logger.error('Error message: ', error.message);
  logger.error('Error name: ', error.name);
  if (error instanceof AuthError || error instanceof PlaidError) {
    logger.error('Auth error identified');
    res.status(error.statusCode).json({
      message: error.message,
      name: error.name,
      type: error.type,
    });
  } else if (error instanceof ValidationError) {
    const errors = error.errors.map((e) => ({
      type: e.type,
      message: e.message,
      path: e.path,
    }));
    res
      .status(400)
      .json({ type: ErrorType.VALIDATION_ERROR, name: error.name, errors });
  } else {
    res.status(400).json({ type: ErrorType.GENERIC_ERROR });
  }

  // _next(error);
};

morgan.token('body', (request) => {
  const data = request.body;
  return JSON.stringify(data);
});

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    const user: User = req.user as unknown as User;
    if (!user.isActive) {
      throw new AuthError('User is not active', AuthErrorName.USER_INACTIVE);
    }
    if (!user.isVerified) {
      throw new AuthError(
        'User is not verified',
        AuthErrorName.USER_NOT_VERIFIED,
      );
    }
    return next();
  }
  throw new AuthError('Unauthorized', AuthErrorName.USER_UNAUTHORIZED);
};

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(404).json('Unauthorized');
};

export default {
  unknownEndpoint,
  errorHandler,
  morgan,
  isAuthenticated,
};
