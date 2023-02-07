import { NextFunction, Request, Response } from 'express';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';
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

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userServiceManagment.deleteUser(req.params.idUser);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};
