import { ROLES } from './../../../shared/config/roles';
import {
  addProductsToOrderController,
  changeOrderStatusController,
  createOrderController,
  deleteOrderController,
  deleteProductOfOrderController,
  getOrdersController,
  updateCommentOrIngredientsOfAProductOfOrderController
} from './../controllers/order';
// Controlador de rutas para el cocinero del horno
// Controlador de rutas para el cocinero de cocina
import express from 'express';
import { MiddlewareAuthentication } from '../../../shared/middleware';

const routesOrder = express();

// Create Order (El mesero crea la orden)
routesOrder.post('/create-order', new MiddlewareAuthentication([ROLES.WAITER]).verifyToken, createOrderController);

// Update Order (Actualizar a orden finalizada)

routesOrder.put(
  '/change-status-order/:idOrder',
  new MiddlewareAuthentication([ROLES.LEADER]).verifyToken,
  changeOrderStatusController
);

routesOrder.put(
  '/change-status-order/:idOrder',
  new MiddlewareAuthentication([ROLES.LEADER]).verifyToken,
  changeOrderStatusController
);

routesOrder.put(
  '/add-products-to-order/:idOrder',
  new MiddlewareAuthentication([ROLES.WAITER]).verifyToken,
  addProductsToOrderController
);

routesOrder.put(
  '/update-comments-or-ingredients-of-product/:idOrder',
  new MiddlewareAuthentication([ROLES.WAITER]).verifyToken,
  updateCommentOrIngredientsOfAProductOfOrderController
);

// Get all orders (Obtener todas las ordenes del día)
routesOrder.get('/orders', new MiddlewareAuthentication([ROLES.WAITER, ROLES.LEADER, ROLES.ADMIN]).verifyToken, getOrdersController);

// Delete order (Eliminar una orden que no fue finalizada, si esto sucede
// se deberá enviar un mensaje a las secciones encargadas y eliminar el ticket
// asociado a esta orden )

routesOrder.delete(
  '/delete-order/:idOrder',
  new MiddlewareAuthentication([ROLES.LEADER]).verifyToken,
  deleteOrderController
);

routesOrder.delete(
  '/delete-product-of-order/:idOrder',
  new MiddlewareAuthentication([ROLES.WAITER]).verifyToken,
  deleteProductOfOrderController
);

export default routesOrder;
