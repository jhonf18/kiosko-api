import { NextFunction, Request, Response } from 'express';
import { branchOfficeService } from '../dependencyInjector';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';

export const getBranchOfficesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await branchOfficeService.getBranchOffices(req.query.get as string);
    if (!data) {
      return response(null, 'No se encontrarón sucursales', httpStatus.OK, res);
    }

    return response([data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const getBranchOfficeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await branchOfficeService.getBranchOffice(req.params.idBranchOffice, req.query.get as string);
    if (!data) {
      return response(null, 'No se encontró la sucursal', httpStatus.OK, res);
    }
    return response([data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const createBranchOfficeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await branchOfficeService.createBranchOffice({
      name: req.body.name,
      address: req.body.address,
      employees: req.body.employees
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const updateBranchOfficeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await branchOfficeService.updateBranchOffice(req.params.idBranchOffice, {
      name: req.body.name,
      address: req.body.address,
      employees: req.body.employees
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const deleteBranchOfficeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await branchOfficeService.deleteBranchOffice(req.params.idBranchOffice);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};
