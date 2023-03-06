import { ROLES } from './../../../shared/config/roles';
// Controlador de rutas para el cocinero de cocina
import express from 'express';
import { MiddlewareAuthentication } from '../../../shared/middleware';
import { changeStateTicketController, getTicketsController } from '../controllers/ticket';

const routesTicket = express();

/**
 * TODO: Cambiar el estado del ticket (ticket aceptado y finalizado)
 */

routesTicket.put(
  '/change-status-ticket/:idTicket',
  new MiddlewareAuthentication([ROLES.KITCHEN_COOK, ROLES.OVEN_COOK]).verifyToken,
  changeStateTicketController
);

/**
 * TODO: Obtener tickets
 */

routesTicket.get(
  '/tickets',
  new MiddlewareAuthentication([ROLES.KITCHEN_COOK, ROLES.OVEN_COOK]).verifyToken,
  getTicketsController
);

export default routesTicket;
