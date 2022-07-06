/* eslint-disable @typescript-eslint/no-unused-vars */
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import logger from './logger';

const unknownEndpoint = (_request: Request, response: Response): void => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
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
  if (error instanceof ValidationError) {
    console.log('Identified validation error');
    const errors = error.errors.map((e) => ({
      type: e.type,
      message: e.message,
      path: e.path,
    }));
    console.log({ name: error.name, errors });
    response
      .status(400)
      .json({ type: 'ValidationError', name: error.name, errors });
  } else {
    response.status(400).json({ error: error.message });
  }

  // _next(error);
};

morgan.token('body', (request) => {
  const data = request.body;
  return JSON.stringify(data);
});

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('is auth middleware');
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
