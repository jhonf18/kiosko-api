import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { DishVariantModel } from './../../backOffice/schemas/dishVariant';
import { IngredientModel } from './../../backOffice/schemas/ingredients';
import { ProductModel } from './../../backOffice/schemas/product';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { OrderModel } from './../schemas/order';
import { TicketModel } from './../schemas/ticket';

interface ITicketInput {
  id: string;
  product?: string;
  custom_product?: Object;
  sections: string[];
  comments: string;
  order?: string;
}

interface ITicketUpdate {
  date_finished?: Date;
  date_accepted?: Date;
  finished?: Boolean;
}

export class TicketRepository {
  constructor(private readonly ticketStore: typeof TicketModel) {}

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

  public async find(conditions: Object | null, getData?: string, getKeyID?: boolean) {
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
            if (selectPopulateArray.some((el: string) => el === 'variants')) {
              populate.populate = [
                {
                  path: 'variants',
                  select: 'id name ingredients -_id',
                  model: DishVariantModel,
                  populate: {
                    path: 'ingredients',
                    model: IngredientModel,
                    select: 'name type id -_id'
                  }
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

    try {
      return await this.ticketStore.find(conditions, getData).populate(populate);
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

  public async findOne(conditions: Object, getData?: string) {
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
