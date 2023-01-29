import { NextFunction, Request, Response } from 'express';
import { getKeyByValue } from '../../utilities';
import { ApiError } from './ApiError';
import { httpStatus } from './httpStatusCodes';

interface ResponseError {
  data: Array<any> | null;
  error: Object | null;
  messages: Object | null;
}

export const errorHandlerApp = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let response: ResponseError = {
    data: [],
    error: null,
    messages: null
  };

  // if (res.headersSent) {
  //   return next(err);
  // }

  if (err.isOperational) {
    res.status(err.statusCode);
    const code = getKeyByValue(httpStatus, err.statusCode);
    response.error = {
      type: err.name,
      code,
      message: err.description
    };
  } else {
    res.status(500);
    response.error = {
      type: 'Unexpected error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ha ocurrido un error inesperado en el servidor.'
    };
  }

  res.send(response);
};
