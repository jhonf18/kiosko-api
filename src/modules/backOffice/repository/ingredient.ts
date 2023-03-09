import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { IIngredient, IUpdateIngredient } from './../interfaces/IIngredient';
import { IngredientModel } from './../schemas/ingredients';

export class IngredientRepository {
  constructor(private readonly ingredientStore: typeof IngredientModel) {}

  public async save(ingredient: IIngredient) {
    const ingredientStore = new this.ingredientStore(ingredient);
    try {
      return await ingredientStore.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear el ingrediente',
        true,
        error.message
      );
    }
  }

  public async findOne(conditions?: Object, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.ingredientStore.findOne(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener el ingrediente',
        true,
        error.message
      );
    }
  }

  public async find(conditions?: Object, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.ingredientStore.find(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener los ingredientes',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, ingredient: IUpdateIngredient) {
    try {
      return await this.ingredientStore.findOneAndUpdate(conditions, ingredient, {
        new: true
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar el ingrediente',
        true,
        error.message
      );
    }
  }

  public async delete(conditions: Object) {
    try {
      const result = await this.ingredientStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar el ingrediente',
        true,
        error.message
      );
    }
  }

  public async findIngredientsFromArrayWithMultiplesIDS(idsArray: Array<string>, getData?: string) {
    let arrayForSearch = [];
    for (const id of idsArray) {
      arrayForSearch.push({ id });
    }

    let ingredientsStore = [];

    try {
      ingredientsStore = await this.ingredientStore.find({ $or: arrayForSearch }, getData);
    } catch (err: any) {
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Ha ocurrido un error al obtener los ingredientes.',
        true,
        err.message
      );
    }

    if (ingredientsStore.length !== idsArray.length) {
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Alguno de los ingredientes no se encuentran en nuestra base de datos.',
        true
      );
    }

    return ingredientsStore;
  }

  public async findIngredientFromArrayIdsToIdkey(array: Array<string>) {
    let _ids = [];

    for await (let id of array) {
      const ingredient = await this.findOne({ id: id }, '_id');

      if (!ingredient) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'No se ha encontrado el id del del ingrediente al buscar.',
          true,
          'No se ha encontrado el _id del ingrediente al buscar, path:/IngredientRepository/findUsersFromArrayIdsToIdkey'
        );
      }
      _ids.push(ingredient?._id);
    }

    return _ids;
  }
}
