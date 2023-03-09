import { NextFunction, Request, Response } from 'express';
import { getKeyByValue } from '../../utilities';
import { ApiError } from './ApiError';
import { logError } from './errorHandler';
import { httpStatus } from './httpStatusCodes';

interface ResponseError {
  data: Array<any> | null;
  error: Object | null;
  message: Object | null;
}

export const errorHandlerApp = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let response: ResponseError = {
    data: [],
    error: null,
    message: null
  };

  console.log(err);

  if (err.isOperational) {
    res.status(err.statusCode);
    const code = getKeyByValue(httpStatus, err.statusCode);
    if (err.name === 'CUSTOM') {
      response.error = {
        type: err.description,
        code,
        message: err.cause
      };
    } else {
      response.error = {
        type: err.name,
        code,
        message: err.description
      };
    }
  } else {
    logError(err);
    res.status(500);
    response.error = {
      type: 'Unexpected error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ha ocurrido un error inesperado en el servidor.'
    };
  }

  res.send(response);
};
