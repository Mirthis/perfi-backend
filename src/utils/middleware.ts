import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
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
  const returnMessageName = [
    'SequelizeValidationError',
    'SequelizeUniqueConstraintError',
  ];
  logger.error('Error: ', error);
  logger.error('Error message: ', error.message);
  logger.error('Error name: ', error.name);
  // TODO: improve return values
  if (returnMessageName.includes(error.name)) {
    response.status(400).json({ error: error.message });
  } else {
    response.status(400).json({ error: error.message });
  }

  // _next(error);
};

morgan.token('body', (request, _response) => {
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
  return res.redirect('/login');
};

export default {
  unknownEndpoint,
  errorHandler,
  morgan,
  isAuthenticated,
};
