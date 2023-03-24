import { NextFunction, Request, Response } from 'express';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';
import { ROLES } from './../../../shared/config/roles';
import { userServiceManagment } from './../dependencyInjector';

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await userServiceManagment.updateUser(req.params.idUser, {
      name: req.body.name,
      password: req.body.password,
      role: req.body.role,
      branchOffice: req.body.branch_office,
      active: req.body.active
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { result } = await userServiceManagment.verifyPassword(res.locals.userID, req.body.password);

    response(result, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userServiceManagment.deleteUser(req.params.idUser);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const getRolesController = (_req: Request, res: Response) => {
  const roles = [
    { value: 'ROLE_ADMIN', name: 'Administrador' },
    { value: 'ROLE_WAITER', name: 'Mesero' },
    { value: 'ROLE_LEADER', name: 'Líder' },
    { value: 'ROLE_KITCHEN_COOK', name: 'Cocinero de cocina' },
    { value: 'ROLE_OVEN_COOK', name: 'Cocinero de horno' }
  ];
  const values = Object.values(ROLES);

  const rolesWithNames = values.map(v => {
    return roles.find(r => r.value === v);
  });

  return response(rolesWithNames, 'OK', httpStatus.OK, res);
};

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  let filter = JSON.parse(JSON.stringify(req.query));
  delete filter.get;
  try {
    const users = await userServiceManagment.getUsers(filter, req.query.get as string);
    return response(users, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};
