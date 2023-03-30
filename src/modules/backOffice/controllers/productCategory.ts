import { NextFunction, Request, Response } from 'express';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';
import { productCategoryService } from './../dependencyInjector';

// Controllers of type GET
export const getCategoryController = (_req: Request, _res: Response, _next: NextFunction) => {};

export const getCategoriesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productCategoryService.getCategoriesOfProducts(req.query.get as string);
    if (!data) {
      return response(null, 'No se encontrarón ingredientes.', httpStatus.OK, res);
    }

    return response(data, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type POST
export const createCategoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = await productCategoryService.createCategoryOfProduct({
      name: req.body.name,
      subcategories: req.body.subcategories
    });

    response(category, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type PUT
export const updateCategoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = await productCategoryService.updateCategory(req.params.idCategory, {
      name: req.body.name,
      subcategories: req.body.subcategories
    });

    response(category, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type DELETE
export const deleteCategoryController = (_req: Request, _res: Response, _next: NextFunction) => {};
