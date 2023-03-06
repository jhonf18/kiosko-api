import * as awilix from 'awilix';
import { container } from '../../shared';
import { OrderRepository } from './repository/order';
import { TicketRepository } from './repository/ticket';
import { OrderModel } from './schemas/order';
import { TicketModel } from './schemas/ticket';
import { OrderService } from './services/Order';
import { TicketService } from './services/Ticket';

container.register({
  ticketStore: awilix.asValue(TicketModel),
  ticketRepo: awilix.asClass(TicketRepository),
  ticketService: awilix.asClass(TicketService),
  orderStore: awilix.asValue(OrderModel),
  orderRepo: awilix.asClass(OrderRepository),
  orderService: awilix.asClass(OrderService)
});

export const ticketService: TicketService = container.resolve('ticketService');
export const orderService: OrderService = container.resolve('orderService');
