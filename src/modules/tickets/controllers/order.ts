import { NextFunction, Request, Response } from 'express';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';
import { orderService } from './../dependencyInjectorTickets';

export const createOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await orderService.createOrder({
      name: req.body.name,
      selectedProducts: req.body.selected_products,
      totalPrice: req.body.total_price,
      isOpen: req.body.is_open,
      comments: req.body.comments,
      branchOffice: res.locals.branchOfficeID,
      waiter: res.locals.userID
    });

    response(data, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const getOrdersController = async (req: Request, res: Response, next: NextFunction) => {
  let filter = JSON.parse(JSON.stringify(req.query));
  delete filter.get;

  try {
    const data = await orderService.getOrders(filter, req.query.get as string);
    if (!data) {
      return response(null, 'No se encontraron ordenes.', httpStatus.OK, res);
    }

    return response(data, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const deleteOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.deleteOrder(req.params.idOrder);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const changeOrderStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order } = await orderService.changeStatusOfOrder(req.params.idOrder, req.body.is_open);

    response(order, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const addProductsToOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await orderService.addProductsToOrder(req.params.idOrder, req.body.selected_products);

    response(data, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const deleteProductOfOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await orderService.deleteProductToOrder(req.params.idOrder, {
      productID: req.body.product_id,
      comments: req.body.product_comments
    });

    response(data, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const updateCommentOrIngredientsOfAProductOfOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let data = await orderService.updateCommentOrIngredientsToProductOfOrder(req.params.idOrder, {
      productID: req.body.product_id,
      comments: req.body.product_comments,
      ingredients: req.body.product_ingredients
    });

    response(data, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};
