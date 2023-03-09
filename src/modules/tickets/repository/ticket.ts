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
            if (selectPopulateArray.some((el: string) => el === 'ingredients')) {
              populate.select += ' selected_ingredients.quantity';
              populate.populate = [
                {
                  path: 'selected_ingredients.ingredient',
                  select: 'id name type -_id',
                  model: IngredientModel
                }
              ];
            }
          } else if (populate.path === 'order') {
            populate.model = OrderModel;
          }

          populate.select += ' -_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
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

    try {
      return await this.ticketStore.find(conditions, getData).populate(populate);
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
