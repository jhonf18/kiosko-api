import { v4 as uuid4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { getIndexOfElmentInArray } from './../../../utilities/index';
import { ICreateOrder, ICustomProductInput } from './../dto';

import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { BranchOfficeRepository } from './../../backOffice/repository/branchOffice';
import { OrderRepository } from './../repository/order';
import { TicketService } from './Ticket';
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository,
    private readonly ticketService: TicketService,
    private readonly userService: UserService
  ) {}

  private validateCustomProduct(products: Array<ICustomProductInput>) {
    for (const product of products) {
      // Verify that product content is valid
      if (
        !product.name ||
        product.name.length < 1 ||
        !product.sections ||
        product.sections.length < 1 ||
        !product.price ||
        typeof product.price !== 'number'
      ) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'Datos del producto incorrectos, son necesarios el nombre, precio y las secciones de paso del producto.',
          true
        );
      }

      product.comments = product.comments || '';
      product.ingredients = product.ingredients || [];
      product.variant = product.variant || null;
      if (product.ingredients.length < 1 && !product.variant) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'Datos incorrectos, es necesario al menos la variante o los ingredientes del plato.',
          true
        );
      }
    }

    return products;
  }

  public async createOrder(order: ICreateOrder) {
    let customerProducts: Array<ICustomProductInput> = [];

    if (!order.totalPrice)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Debes ingresar el precio total de la orden.', true);

    if (
      (!order.customProducts || order.customProducts.length === 0) &&
      (!order.products || order.products.length === 0)
    )
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se ha ingresado productos a la orden.', true);

    // Validate that custom product object is valid
    if (order.customProducts && order.customProducts.length > 0) {
      customerProducts = this.validateCustomProduct(order.customProducts);
    }

    if (!order.branchOffice)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID de la sucursal.', true);

    // Find Branch Office
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: order.branchOffice }, 'id');
    if (!branchOfficeStore)
      throw new ApiError('Not Found Branch Office', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal.', true);

    if (!order.waiter)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID del mesero.', true);

    const waiterStore = await this.userService.findUserById(order.waiter, 'id role');
    if (!waiterStore || waiterStore.role !== 'ROLE_WAITER')
      throw new ApiError(
        'Not Found Waiter',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el mesero o no es un mesero.',
        true
      );

    // Create order
    const data = await this.orderRepo.saveOrderAndGenerateTickets({
      id: uuid4(),
      products: order.products,
      comments: order.comments,
      total_price: order.totalPrice,
      branch_office: order.branchOffice,
      is_open: order.isOpen,
      custom_products: customerProducts,
      waiter: order.waiter
    });

    let ticketsIDS: any[] = data.tickets.map((ticket: any) => ({ id: ticket.id }));

    const tickets = await this.ticketService.getTickets(
      { $or: ticketsIDS },
      'id,sections,custom_product,product.variants,comments'
    );

    let response = JSON.parse(JSON.stringify(data));
    response.tickets = tickets;
    return response;
  }

  // Arreglar el filtro para que busque por id de meseros
  public async getOrders(filter: Object, getData?: string) {
    getData = getData || '';
    const getDataArray = getData.split(',');
    getData = getDataArray.join(' ');

    let orders = await this.orderRepo.find(filter, getData);

    orders = JSON.parse(JSON.stringify(orders));
    for (const order of orders) {
      if (order.products) {
        const products = order.products as any[];
        for (const productContent of products) {
          if (productContent.product && productContent.product.variants && productContent.variant) {
            const index = getIndexOfElmentInArray(
              productContent.product.variants.map((el: any) => el.id),
              productContent.variant
            );
            if (typeof index === 'number') {
              const variant = productContent.product.variants[index];
              delete productContent.product.variants;
              //delete productContent.variant;
              productContent.variant = variant;
            }
          }
          productContent.name = productContent.product.name;
          productContent.price = productContent.product.price;
          productContent.sections = productContent.product.passage_sections;
          delete productContent.product;
        }
      }

      // Concat products
      if (order.custom_products) {
        order.products = order.products.concat(order.custom_products);
      }
      delete order.custom_products;
    }

    return orders;
  }

  public async deleteOrder(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const result = await this.orderRepo.deleteOrdersWithAssociatedTickets({ id: id });

    if (!result || result === 0)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró la orden para eliminar', true);

    return true;
  }

  public async changeStatusOfOrder(id: string, status: boolean) {
    if (!id) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    if (typeof status !== 'boolean')
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'No se puede leer el estado de la orden para actualizar',
        true
      );

    const result = await this.orderRepo.update({ id }, { is_open: status });

    return { order: result };
  }
}
