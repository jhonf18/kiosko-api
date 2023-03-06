import { v4 as uuidv4 } from 'uuid';
import { UserService } from './../../../shared/services/user';
import { getIndexOfElmentInArray, getObjectFromArray } from './../../../utilities/index';
import { DishVariantRepository } from './../../backOffice/repository/dishVariant';
import { IngredientRepository } from './../../backOffice/repository/ingredient';
import { DishVariantModel } from './../../backOffice/schemas/dishVariant';
import { IngredientModel } from './../../backOffice/schemas/ingredients';

import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { ICustomProduct, IOrder, IUpdateOrder } from './../../backOffice/interfaces/IOrder';
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
    private readonly ingredientRepo: IngredientRepository,
    private readonly dishVariantRepo: DishVariantRepository,
    private readonly userService: UserService
  ) {}

  private preparateTicketsForSave(products: Array<any>, orderIDKey: any, branchOfficeID: any) {
    let tickets = [];

    for (const product of products) {
      if (product.passage_sections[0] === 'TANQUES') continue;

      tickets.push({
        id: uuidv4(),
        product: product._id,
        product_variant_id: product.variant,
        sections: product.passage_sections,
        comments: product.comments || '',
        order: orderIDKey,
        branch_office: branchOfficeID
      });
    }

    return tickets;
  }

  private async preparateTicketsWithCustomProducts(
    products: Array<ICustomProduct>,
    orderIDKey: any,
    branchOfficeID: any
  ) {
    let tickets = [];
    for (const product of products) {
      // Validate the ingredients and variations

      if (product.ingredients && product.ingredients.length > 0) {
        let ingredientsArrayObjectForSearch = [];
        for (const ingredientID of product.ingredients) {
          ingredientsArrayObjectForSearch.push({ id: ingredientID });
        }

        const ingredients = await this.ingredientRepo.find({ $or: ingredientsArrayObjectForSearch });
        product.ingredients = ingredients;
      }

      if (product.variant && product.variant.length > 0) {
        const variantStore = (await this.dishVariantRepo.find({ id: product.variant }))[0];
        if (!variantStore) {
          throw new ApiError('Not Found Dish Variant', httpStatus.NOT_FOUND, 'La variante solicitada no existe.', true);
        }

        product.variant = variantStore;
        delete product.variant._id;
        delete product.variant.__v;
        product.variant = JSON.parse(JSON.stringify(product.variant));
      }

      tickets.push({
        id: uuidv4(),
        custom_product: {
          name: product.name,
          price: product.price,
          ingredients: product.ingredients,
          variant: product.variant
        },
        comments: product.comments,
        sections: product.sections,
        order: orderIDKey,
        branch_office: branchOfficeID
      });
    }

    return tickets;
  }

  /**
   *
   * @param order Order object of type @type IOrder
   * @returns This returns a promise, when it is resolve return one object with two properties, orders and tickets.
   */
  public async saveOrderAndGenerateTickets(order: IOrder) {
    // Get _id of branch office
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: order.branch_office }, '_id address', true);
    order.branch_office = branchOfficeStore?._id;

    const waiterStore = await this.userService.findUserById(order.waiter, '_id id', true);
    order.waiter = waiterStore?._id;

    const orderStore = new this.orderStore(order);

    let tickets: any[] = [];
    let productsForTickets = [];

    if (order.custom_products && order.custom_products.length > 0) {
      const ticketsWithCustomProduct = this.preparateTicketsWithCustomProducts(
        order.custom_products,
        orderStore._id,
        branchOfficeStore?._id
      );
      tickets.push(...(await ticketsWithCustomProduct));
    }

    if (order.products && order.products.length > 0) {
      // Get _ids of products
      const productsStore = await this.productRepo.findProductsFromArrayWithMultipleIDS(
        order.products.map(el => el.product_id) as string[],
        '_id passage_sections id'
      );
      let productsArray = [];
      for (const product of productsStore) {
        const orderObject = getObjectFromArray(order.products, 'product_id', product.id) as {
          id: string;
          variant: string;
          comments?: string;
        };
        productsForTickets.push({
          _id: product._id,
          comments: orderObject.comments,
          passage_sections: product.passage_sections,
          variant: orderObject.variant
        });
        productsArray.push({ product: product._id, variant: orderObject.variant, comments: orderObject.comments });
      }

      orderStore.products = productsArray;

      // Generate tickets for this order
      tickets.push(...this.preparateTicketsForSave(productsForTickets, orderStore._id, branchOfficeStore?._id));
    }

    let orderRecord;
    const ticketsRecord = await this.ticketRepo.saveMany(tickets);

    try {
      orderRecord = await orderStore.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la orden.',
        true,
        error.message
      );
    }

    return { order: orderRecord, tickets: ticketsRecord };
  }

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
          if (populate.path === 'products') {
            getData += ' custom_products';
            populate.path = 'products.product';
            populate.model = ProductModel;

            const findVariantObj = getObjectFromArray(parametrizationSearchParams.populateOneLevel, 'path', 'variants');
            if (typeof findVariantObj !== 'boolean') {
              populate.populate = {
                path: 'variants',
                select: findVariantObj.select + ' -_id',
                model: DishVariantModel,
                populate: {
                  path: 'ingredients',
                  model: IngredientModel,
                  select: 'name type id -_id'
                }
              };

              const index = getIndexOfElmentInArray(parametrizationSearchParams.populateOneLevel, findVariantObj);
              if (typeof index === 'number') parametrizationSearchParams.populateOneLevel.splice(index, 1);
            }
          } else if (populate.path === 'branch_office') {
            populate.model = BranchOfficeModel;
          }

          populate.select += ' -_id';
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

  public async update(conditions: Object, orderUpdate: IUpdateOrder) {
    conditions = conditions || {};

    try {
      return await this.orderStore.findOneAndUpdate(conditions, orderUpdate, { new: true });
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
}
