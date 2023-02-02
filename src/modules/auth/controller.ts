import express from 'express';
import { httpStatus } from './../../config/errors/httpStatusCodes';

import * as awilix from 'awilix';
import { response } from '../../config/response/response';
import { container } from '../../shared';
import { ValidatorUser } from '../utils/validations';
import { AuthService } from './service';

container.register({
  authService: awilix.asClass(AuthService),
  validatorUser: awilix.asClass(ValidatorUser)
});

const authService: AuthService = container.resolve('authService');

const routesAuth = express();

routesAuth.post('/signup', async (req, res, next) => {
  try {
    let user = await authService.signup({
      name: req.body.name,
      email: req.body.email,
      password_1: req.body.password_1,
      password_2: req.body.password_2
    });

    response([user], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
});

routesAuth.post('/signin', async (req, res, next) => {
  try {
    let user = await authService.signin({
      nickname: req.body.nickname,
      password: req.body.password
    });

    response([user], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
});

export default routesAuth;
