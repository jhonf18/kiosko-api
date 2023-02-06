import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env/env';
import { ApiError } from '../config/errors/ApiError';
import { httpStatus } from '../config/errors/httpStatusCodes';
import { BlackListRepository } from './../modules/auth/repository/blackList';
import { BranchOfficeModel } from './../modules/backOffice/schemas/branchOffice';
import { UserRepository } from './repository/user';
import { UserModel } from './schemas/user';

interface JwtPayloadApp extends jwt.JwtPayload {
  id: string;
  jti: string;
}
export class MiddlewareAuthentication {
  private blackListRepo = new BlackListRepository();
  private userRepo = new UserRepository(UserModel, BranchOfficeModel);
  private rolesAccepted: Array<string>;

  constructor(rolesAccepted: Array<string>) {
    this.rolesAccepted = rolesAccepted;
  }

  public verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.get('authorization');

    if (!authorization)
      return next(
        new ApiError('Unauthorized', httpStatus.UNAUTHORIZED, 'No se ha podido leer el token de acceso', true)
      );

    // The token is of the form "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6Ik...."
    const token = authorization.split(' ')[1];

    // Verify if token is valid
    jwt.verify(token, JWT_SECRET, async (err, tokenDecoded) => {
      if (err)
        return next(new ApiError('Token invalid', httpStatus.UNAUTHORIZED, 'El token no es válido', true, err.message));

      const tokenD = tokenDecoded as JwtPayloadApp;
      // Verify if the black list has the token

      const blackList = await this.blackListRepo.findToken(tokenD.jti);
      if (blackList) return next(new ApiError('Token invalid', httpStatus.UNAUTHORIZED, 'El token no es válido', true));

      // Find user by id
      const user = (await this.userRepo.getUser({ nameField: 'id', valueField: tokenD.id }, 'role')) || { role: '' };

      // const userRole = user.role;

      if (user && !this.findRoleInRoles(user.role)) {
        return next(
          new ApiError('User not authorized', httpStatus.FORBIDDEN, 'No es posible acceder a este recurso', true)
        );
      }

      res.locals.userID = tokenD.id;
      res.locals.tokenID = tokenD.jti;
      next();
    });
  };

  private findRoleInRoles = (role: string): boolean => {
    let result = false;
    for (let i = 0; i < this.rolesAccepted.length; i++) {
      if (role == this.rolesAccepted[i]) {
        result = true;
        break;
      }
    }
    return result;
  };
}
