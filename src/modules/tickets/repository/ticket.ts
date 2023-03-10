import { UserModel } from '../../../shared/schemas/user';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { ProductRepository } from './../../backOffice/repository/product';
import { IngredientModel } from './../../backOffice/schemas/ingredients';
import { ProductModel } from './../../backOffice/schemas/product';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { OrderModel } from './../schemas/order';
import { TicketModel } from './../schemas/ticket';

interface ITicketInput {
  id: string;
  product?: string;
  sections: string[];
  comments: string;
  order?: string;
}

interface ITicketUpdate {
  ingredients?: Array<string>;
  comments?: string;
  date_finished?: Date;
  date_accepted?: Date;
  finished?: Boolean;
}

export class TicketRepository {
  constructor(private readonly ticketStore: typeof TicketModel, private readonly productRepo: ProductRepository) {}

  public async saveMany(tickets: Array<ITicketInput>) {
    try {
      return await this.ticketStore.insertMany(tickets);
    } catch (err: any) {
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Ha ocurrido un error al crear los tickets.',
        true,
        err.message
      );
    }
  }

  public async deleteMany(conditions: Object) {
    try {
      const result = await this.ticketStore.deleteMany(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar los tickets.',
        true,
        error.message
      );
    }
  }

  public async updateOne(conditions: Object, ticketUpdate: ITicketUpdate) {
    try {
      return await this.ticketStore.findOneAndUpdate(conditions, ticketUpdate, {
        new: true
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar el ticket',
        true,
        error.message
      );
    }
  }

  public async find(conditions: any | null, getData?: string, getKeyID?: boolean) {
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
          if (populate.path === 'product') {
            populate.model = ProductModel;

            const selectPopulateArray = populate.select.split(' ');
            if (selectPopulateArray.includes('ingredients')) {
              getData += ' ingredients';
              populate.select += ' selected_ingredients selected_ingredients.quantity selected_ingredients.ingredient';
              populate.populate = {
                path: 'selected_ingredients.ingredient',
                select: 'id name type -_id',
                model: IngredientModel
              };
            }
          } else if (populate.path === 'order') {
            populate.model = OrderModel;
          } else if (populate.path === 'waiter') {
            let index = -1;
            const orderPopulate = parametrizationSearchParams.populateOneLevel.find((popu, indexFinded) => {
              index = indexFinded;
              return popu.path === 'order';
            });

            populate.path = 'order';
            populate.model = OrderModel;
            const fieldsWaiterToPopulate = populate.select;

            if (index >= 0) {
              populate.select = orderPopulate.select;
              parametrizationSearchParams.populateOneLevel.splice(index, 1);
            }

            populate.populate = {
              path: 'waiter',
              model: UserModel,
              select: fieldsWaiterToPopulate + ' -_id'
            };
          }

          populate.select += ' -_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
        console.log('🚀 ~ file: ticket.ts:124 ~ TicketRepository ~ find ~ populate:', populate);
      }
    } else {
      getData = '';
    }

    if (conditions.hasOwnProperty('product')) {
      const productStorePromise = this.productRepo.findOne({ id: conditions.product }, '_id', true);

      const [productStore] = await Promise.all([productStorePromise]);

      if (!productStore)
        throw new ApiError(
          'Not Found',
          httpStatus.INTERNAL_SERVER_ERROR,
          'No se ha encontrado el producto y/o la orden.',
          true
        );

      conditions.product = productStore._id;
    }

    if (conditions.hasOwnProperty('sort')) {
      options.sort[conditions.sort.field] = conditions.sort.type === 'asc' ? 1 : -1;
    }

    try {
      return await this.ticketStore.find(conditions, getData, options).populate(populate);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener los tickets.',
        true,
        error.message
      );
    }
  }

  public async findOne(conditions: any, getData?: string) {
    conditions = conditions || {};

    try {
      return await this.ticketStore.findOne(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener el ticket.',
        true,
        error.message
      );
    }
  }
}
