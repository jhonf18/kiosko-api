import express from 'express';
import { ApiError } from '../../config/errors/ApiError';
import { response } from '../../config/response/response';
import { logError } from './../../config/errors/errorHandler';
import { httpStatus } from './../../config/errors/httpStatusCodes';

const routesAuth = express();

routesAuth.get('/', async (_req, res, next) => {
  const getData = (id: number) => {
    return new Promise((resolve, reject) => {
      if (id === 1) {
        reject(new ApiError('Bad data', httpStatus.BAD_REQUEST, 'Faltan datos', true));
      } else {
        resolve({ user: [] });
      }
    });
  };

  try {
    const data = await getData(1);
    response([data], 'OK', httpStatus.OK, res);
  } catch (error) {
    logError(error);
    next(error);
  }
});

export default routesAuth;
