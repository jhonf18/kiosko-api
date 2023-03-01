import { DishVariantModel } from '../schemas/dishVariant';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { IDishVariant, IUpdateDishVariant } from './../interfaces/dishVariant';
import { IngredientModel } from './../schemas/ingredients';
import { IngredientRepository } from './ingredient';
export class DishVariantRepository {
  constructor(
    private readonly dishVariantStore: typeof DishVariantModel,
    private readonly ingredientRepo: IngredientRepository
  ) {}

  public async save(variant: IDishVariant) {
    // Search the ingredients by Id and then get the _ids to save them in the database with dish variant
    if (variant.ingredients) {
      const ingredients = await this.ingredientRepo.findIngredientFromArrayIdsToIdkey(variant.ingredients);
      console.log(ingredients);
      variant.ingredients = ingredients;
    }

    // Create dish variant store and then save it in database
    const ingredientStore = new this.dishVariantStore(variant);

    try {
      return await ingredientStore.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la variante.',
        true,
        error.message
      );
    }
  }

  public async findOne(conditions?: Object, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.dishVariantStore.findOne(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener la variante.',
        true,
        error.message
      );
    }
  }

  public async find(conditions?: Object, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.dishVariantStore.find(conditions, getData).populate({
        path: 'ingredients',
        model: IngredientModel,
        select: 'id name type -_id'
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener las variantes.',
        true,
        error.message
      );
    }
  }

  public async delete(conditions: Object) {
    try {
      const result = await this.dishVariantStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar la variante.',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, variant: IUpdateDishVariant) {
    // Search the ingredients by Id and then get the _ids to save them in the database with dish variant
    if (variant.ingredients) {
      const ingredients = await this.ingredientRepo.findIngredientFromArrayIdsToIdkey(variant.ingredients);
      variant.ingredients = ingredients;
    }

    try {
      return await this.dishVariantStore.findOneAndUpdate(conditions, variant, {
        new: true
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar la variante.',
        true,
        error.message
      );
    }
  }

  public async findVariantFromArrayIdsToIdkey(array: Array<string>) {
    let _ids = [];

    for await (const id of array) {
      const variant = await this.findOne({ id: id }, '_id');
      if (!variant) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'No se ha encontrado el id del de la variante al buscar.',
          true,
          'No se ha encontrado el _id de la variante al buscar, path:/DishVariantRepository/findUsersFromArrayIdsToIdkey'
        );
      }
      _ids.push(variant?._id);
    }

    return _ids;
  }
}
