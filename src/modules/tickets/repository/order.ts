import { v4 as uuidv4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { IngredientModel } from './../../backOffice/schemas/ingredients';

import { UserModel } from '../../../shared/schemas/user';
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
      const selectedProductsToSave = (await this.preparateProductsToSave(
        order.selected_products,
        orderStore._id,
        branchOfficeStore?._id
      )) as { products: ISelectedProduct[]; tickets: any[] };
      order.selected_products = selectedProductsToSave.products;
      tickets = selectedProductsToSave.tickets;
    }

    const ticketsRecord = await this.ticketRepo.saveMany(tickets);

    try {
      const orderRecord = await orderStore.save();
      const orderToSend = await this.find(
        { _id: orderRecord._id },
        'id name created_at waiter.id is_open branch_office.id total_price waiter.name waiter.nickname selected_products.id selected_products.name selected_products.price selected_products.media_files selected_products.selected_ingredients',
        true
      );

      return { order: orderToSend[0], tickets: ticketsRecord };
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
    let options: { sort: { [key: string]: number } } = { sort: {} };

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

            getData +=
              ' selected_products.ids_selected_ingredients selected_products.comments selected_products.ticket_id';

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
          } else if (populate.path === 'waiter') {
            populate.model = UserModel;
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

    if (conditions.hasOwnProperty('branch_office')) {
      if (conditions.branch_office.length > 1) {
        const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: conditions.branch_office }, '_id id', true);
        conditions.branch_office = branchOfficeStore?._id;
      } else {
        delete conditions.branch_office;
      }
    }

    if (conditions.hasOwnProperty('sort')) {
      options.sort[conditions.sort.field] = conditions.sort.type === 'asc' ? 1 : -1;
    }

    try {
      return await this.orderStore.find(conditions, getData, options).populate(populate);
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

  public async findOne(conditions: Object | any, getData?: string) {
    try {
      return await this.orderStore.findOne(conditions, getData);
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
  public async update(conditions: Object, orderUpdate: IUpdateOrder, orderStoreDB?: any) {
    conditions = conditions || {};
    let orderUpdateForDB = orderUpdate as any;

    let tickets: any[] = [];

    // Add products to order
    if (orderUpdate.added_products && orderUpdate.added_products.length > 0) {
      const addedProductsForSave = (await this.preparateProductsToSave(
        orderUpdate.added_products,
        orderStoreDB._id,
        orderStoreDB.branch_office,
        true
      )) as {
        products: Array<ISelectedProduct>;
        totalPrice: number;
        tickets: any[];
      };
      // Create tickets
      //
      orderUpdateForDB.$push = {
        selected_products: { $each: addedProductsForSave.products }
      };

      tickets = addedProductsForSave.tickets;
      orderUpdateForDB.total_price = orderStoreDB.total_price + addedProductsForSave.totalPrice;
    }

    const ticketsRecord = await this.ticketRepo.saveMany(tickets);

    try {
      if (orderUpdate.added_products && orderUpdate.added_products.length > 0) {
        const order = await this.orderStore.findOneAndUpdate(conditions, orderUpdateForDB, { new: true });
        return { order, tickets: ticketsRecord };
      } else {
        return await this.orderStore.findOneAndUpdate(conditions, orderUpdateForDB, { new: true });
      }
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

  /**
   * It takes an array of objects with a product property, and returns an array of objects with the changes product id by
   * _id, and add property passage_sections because it is necessary for create tickets
   * @param products - Array<ISelectedProduct>
   * @returns a Promise<Array<ISelectedProduct>>
   */
  private async preparateProductsToSave(
    products: Array<ISelectedProduct>,
    orderIDKey: any,
    branchOfficeID: any,
    getPriceProduct?: boolean
  ): Promise<
    | { products: Array<ISelectedProduct>; tickets: Array<any> }
    | { products: Array<ISelectedProduct>; totalPrice: number; tickets: Array<any> }
  > {
    const productsIDS = products.map(selected => selected.product);

    const productsStore = !getPriceProduct
      ? await this.productRepo.findProductsFromArrayWithMultipleIDS(productsIDS, 'id _id passage_sections')
      : await this.productRepo.findProductsFromArrayWithMultipleIDS(productsIDS, 'id _id passage_sections price');

    // TODO: Verificar que los Ids de los ingredientes existan
    let totalPrice = 0;
    let tickets: any[] = [];

    const selectedProductsToSave = products.map(selected => {
      const productStore = productsStore.find(el => el.id === selected.product) as {
        id: string;
        _id: any;
        passage_sections: Array<string>;
        price?: number;
      };
      let result = selected;
      result.product = productStore?._id;
      result.comments = `${uuidv4()}::${!selected.comments ? '' : selected.comments}`;
      result.passage_sections = productStore.passage_sections;

      if (getPriceProduct && productStore.price) totalPrice += productStore.price;

      if (orderIDKey && branchOfficeID && result.passage_sections[0] !== 'BEBIDAS') {
        result.ticket_id = uuidv4();
        tickets.push({
          id: result.ticket_id,
          product: result.product,
          ingredients: result.ids_selected_ingredients,
          sections: result.passage_sections,
          comments: result.comments || '',
          order: orderIDKey,
          branch_office: branchOfficeID
        });
      }

      return result;
    });

    if (getPriceProduct) {
      return { products: selectedProductsToSave, totalPrice, tickets };
    } else {
      return { products: selectedProductsToSave, tickets };
    }
  }
}
