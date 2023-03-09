import { v4 as uuidv4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { IngredientModel } from './../../backOffice/schemas/ingredients';

import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { IOrder, ISelectedProduct, IUpdateOrder } from './../../backOffice/interfaces/IOrder';
import { BranchOfficeRepository } from './../../backOffice/repository/branchOffice';
import { ProductRepository } from './../../backOffice/repository/product';
import { BranchOfficeModel } from './../../backOffice/schemas/branchOffice';
import { ProductModel } from './../../backOffice/schemas/product';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { OrderModel } from './../schemas/order';
import { TicketRepository } from './ticket';

export class OrderRepository {
  constructor(
    private readonly orderStore: typeof OrderModel,
    private readonly productRepo: ProductRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository,
    private readonly ticketRepo: TicketRepository,
    private readonly userService: UserService
  ) {}

  /**
   *
   * @param order Order object of type @type IOrder
   * @returns This returns a promise, when it is resolve return one object with two properties, orders and tickets.
   */
  public async saveOrderAndGenerateTickets(order: IOrder) {
    // Get _id of branch office
    const branchOfficeStorePromise = this.branchOfficeRepo.findOne({ id: order.branch_office }, '_id address', true);
    const waiterStorePromise = this.userService.findUserById(order.waiter, '_id id', true);

    const [branchOfficeStore, waiterStore] = await Promise.all([branchOfficeStorePromise, waiterStorePromise]);

    order.branch_office = branchOfficeStore?._id;
    order.waiter = waiterStore?._id;

    const orderStore = new this.orderStore(order);

    // For save in DB the _id of product for after can populate products
    let tickets: any[] = [];
    if (order.selected_products.length > 0) {
      const selectedProductsToSave = await this.preparateProductsToSave(order.selected_products);
      order.selected_products = selectedProductsToSave;
      tickets = this.preparateTicketsForSave(order.selected_products, orderStore._id, branchOfficeStore?._id);
    }

    const ticketsRecord = await this.ticketRepo.saveMany(tickets);

    try {
      const orderRecord = await orderStore.save();
      return { order: orderRecord, tickets: ticketsRecord };
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la orden.',
        true,
        error.message
      );
    }
  }

  /**
   * It's a function that returns a promise that resolves to an array of objects
   * @param {Object | null | any} conditions - Object | null | any
   * @param {string} [getData] - string
   * @param {boolean} [getKeyID] - boolean
   * @returns the result of the query to the database.
   */
  public async find(conditions: Object | null | any, getData?: string, getKeyID?: boolean) {
    conditions = conditions || {};
    let populate = [];

    if (getData) {
      const parametrizationSearchParams = !getKeyID
        ? parameterizeSearchWithParams(getData, '_id __v', '-_id')
        : parameterizeSearchWithParams(getData, '_id __v');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'selected_products') {
            populate.path = 'selected_products.product';
            populate.model = ProductModel;

            getData += ' selected_products.ids_selected_ingredients selected_products.comments';

            if (populate.select.split(' ').includes('ingredients')) {
              populate.select += ' selected_ingredients selected_ingredients.ingredient selected_ingredients.quantity';
              populate.populate = {
                path: 'selected_ingredients.ingredient',
                select: 'id name type -_id',
                model: IngredientModel
              };
            }
          } else if (populate.path === 'branch_office') {
            populate.model = BranchOfficeModel;
          }

          if (!getKeyID) populate.select += ' -_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '';
    }

    // If client filter with waiter then should search _id of waiter and add to object of search.
    if (conditions.hasOwnProperty('waiter')) {
      if (conditions.waiter.length > 1) {
        const waiterStore = await this.userService.findUserById(conditions.waiter, '_id id', true);
        conditions.waiter = waiterStore?._id;
      } else {
        delete conditions.waiter;
      }
    }

    try {
      return await this.orderStore.find(conditions, getData).populate(populate);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener las ordenes.',
        true,
        error.message
      );
    }
  }

  /**
   * It updates an order in the database
   * @param {Object} conditions - Object
   * @param {IUpdateOrder} orderUpdate - IUpdateOrder
   * @returns The updated order.
   */
  public async update(conditions: Object, orderUpdate: IUpdateOrder) {
    conditions = conditions || {};
    let orderUpdateForDB = orderUpdate as any;

    // Add products to order
    if (orderUpdate.added_products && orderUpdate.added_products.length > 0) {
      const addedProductsForSave = await this.preparateProductsToSave(orderUpdate.added_products);
      // Create tickets
      //
      orderUpdateForDB.$push = {
        selected_products: { $each: addedProductsForSave }
      };
    }

    // Eliminar productos de la orden, si no se ha comenzado hacer el pedido se puede borrar,
    // Si el producto tiene creado un ticket, entonces es necesario el id del ticket para borrarlo
    // Si en dado caso ya se comenzó el único que puede borrarlo es el lider de la sección
    // Actualizar comentarios de productos, siempre y cuando no se haya empezado a realizar el pedido
    // Luego enviar los comentarios al ticket

    try {
      return await this.orderStore.findOneAndUpdate(conditions, orderUpdateForDB, { new: true });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar la orden.',
        true,
        error.message
      );
    }
  }

  /**
   * It deletes all the tickets associated with an order and then deletes the order itself
   * @param {Object} conditions - Object
   * @returns The number of deleted orders.
   */
  public async deleteOrdersWithAssociatedTickets(conditions: Object) {
    // Delete tickets of this order
    const orderStore = await this.find(conditions, '_id id', true);
    await this.ticketRepo.deleteMany({ order: orderStore[0]._id });

    try {
      const result = await this.orderStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado la orden.',
        true,
        error.message
      );
    }
  }

  // public async findOrdersByBranchOfficeIDAndProductID(conditions: { branch_office: string; product_id: string }) {
  //   const productStorePromise = this.productRepo.findOne({ id: conditions.product_id }, '_id');
  //   const branchOfficeStorePromise = this.branchOfficeRepo.findOne({ id: conditions.branch_office }, '_id');

  //   const [productStore, branchOfficeStore] = await Promise.all([productStorePromise, branchOfficeStorePromise]);

  //   if (!branchOfficeStore)
  //     throw new ApiError('Not Found Branch Office', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal.', true);

  //   if (!productStore)
  //     throw new ApiError('Not Found Branch Office', httpStatus.NOT_FOUND, 'No se ha encontrado el producto.', true);

  //   const searchParams = {
  //     product: productStore._id,
  //     branch_office:
  //   }
  // }

  /**
   * It takes an array of objects with a product property, and returns an array of objects with the changes product id by
   * _id, and add property passage_sections because it is necessary for create tickets
   * @param products - Array<ISelectedProduct>
   * @returns a Promise<Array<ISelectedProduct>>
   */
  private async preparateProductsToSave(products: Array<ISelectedProduct>): Promise<Array<ISelectedProduct>> {
    const productsIDS = products.map(selected => selected.product);
    const productsStore = await this.productRepo.findProductsFromArrayWithMultipleIDS(
      productsIDS,
      'id _id passage_sections'
    );

    // TODO: Verificar que los Ids de los ingredientes existan

    const selectedProductsToSave = products.map(selected => {
      const productStore = productsStore.find(el => el.id === selected.product) as {
        id: string;
        _id: any;
        passage_sections: Array<string>;
      };
      let result = selected;
      result.product = productStore?._id;
      result.comments = `${uuidv4()}::${!selected.comments ? '' : selected.comments}`;
      result.passage_sections = productStore.passage_sections;
      return result;
    });

    return selectedProductsToSave;
  }

  /**
   * It takes an array of products, an order ID and a branch office ID and returns an array of tickets
   * @param products - Array<any>
   * @param {any} orderIDKey - The ID of the order that is being created.
   * @param {any} branchOfficeID - The ID of the branch office where the order was made.
   * @returns An array of objects.
   */
  private preparateTicketsForSave(products: Array<any>, orderIDKey: any, branchOfficeID: any) {
    let tickets = [];

    for (const product of products) {
      if (product.passage_sections[0] === 'BEBIDAS') continue;

      tickets.push({
        id: uuidv4(),
        product: product.product,
        ingredients: product.ids_selected_ingredients,
        sections: product.passage_sections,
        comments: product.comments || '',
        order: orderIDKey,
        branch_office: branchOfficeID
      });

      delete product.passage_sections;
    }

    return tickets;
  }
}
