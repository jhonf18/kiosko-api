import express from 'express';
import { httpStatus } from './../../config/errors/httpStatusCodes';

import * as awilix from 'awilix';
import { response } from '../../config/response/response';
import { container } from '../../shared';
import { AuthService } from './service';

container.register({
  authService: awilix.asClass(AuthService)
});

const authService: AuthService = container.resolve('authService');

const routesAuth = express();

routesAuth.post('/signup', async (_req, res, _next) => {
  try {
    let data = await authService.signup({
      name: 's',
      email: 'ss',
      nickname: 's',
      password_1: 's',
      password_2: 's'
    });

    response([data], 'OK', httpStatus.OK, res);
  } catch (error) {
    console.log(error);
    _next(error);
  }
});

export default routesAuth;
