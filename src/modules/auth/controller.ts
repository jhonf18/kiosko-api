import * as awilix from 'awilix';
import express, { NextFunction, Request, Response } from 'express';

import { response } from '../../config/response/response';
import { container } from '../../shared';
import { ValidatorUser } from '../utils/validationsUser';
import { httpStatus } from './../../config/errors/httpStatusCodes';
import { ALL_ROLES } from './../../shared/config/roles';
import { MiddlewareAuthentication } from './../../shared/middleware';
import { BlackListRepository } from './repository/blackList';
import { AuthService } from './service';

container.register({
  authService: awilix.asClass(AuthService),
  validatorUser: awilix.asClass(ValidatorUser),
  blackListRepo: awilix.asClass(BlackListRepository)
});

const authService: AuthService = container.resolve('authService');

const routesAuth = express();

// Signup users
routesAuth.post(
  '/signup',
  new MiddlewareAuthentication(['ROLE_ADMIN', 'ROLE_LEADER']).verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user = await authService.signup({
        name: req.body.name,
        email: req.body.email,
        password_1: req.body.password_1,
        password_2: req.body.password_2,
        role: req.body.role,
        branchOffice: req.body.branch_office
      });

      response([user], 'OK', httpStatus.CREATED, res);
    } catch (error) {
      next(error);
    }
  }
);

// Signin users
routesAuth.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
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

// Signout of users
routesAuth.post(
  '/signout',
  new MiddlewareAuthentication([...ALL_ROLES]).verifyToken,
  async (_req, res: Response, next: NextFunction) => {
    try {
      await authService.signout(res.locals.tokenID);

      response([], 'OK', httpStatus.OK, res);
    } catch (error) {
      next(error);
    }
  }
);

export default routesAuth;
