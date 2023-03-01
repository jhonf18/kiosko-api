import { v4 as uuidv4 } from 'uuid';
import { deleteFields } from '../../utils/deleteFields';
import { IUpdateDishVariantInput } from './../dto/IDishVariant';

import { isNotEmpty } from '../../utils/validations';
import { IDishVariantInput } from '../dto/IDishVariant';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { DishVariantRepository } from './../repository/dishVariant';
export class DishVariantService {
  constructor(private readonly dishVariantRepo: DishVariantRepository) {}

  public async createVariant(variantInput: IDishVariantInput) {
    // validate fields
    const fields: Array<string> = ['name'];

    const validatorSignup = isNotEmpty(variantInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const ingredientRecord = await this.dishVariantRepo.save({
      id: uuidv4(),
      name: variantInput.name,
      ingredients: variantInput.ingredients
    });

    return { ingredient: deleteFields(ingredientRecord) };
  }

  public async getVariants(getData?: string) {
    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.dishVariantRepo.find(getData);
    } else {
      return await this.dishVariantRepo.find();
    }
  }

  public async updateVariant(id: string, updateVariant: IUpdateDishVariantInput) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const dishVariantStore = await this.dishVariantRepo.findOne({ id }, 'id');
    if (!dishVariantStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado la variante a editar', true);
    }

    const dishVariantRecord = await this.dishVariantRepo.update({ id: dishVariantStore.id }, updateVariant);

    return { dish_variant: dishVariantRecord };
  }

  public async deleteVariant(id?: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const result = await this.dishVariantRepo.delete({ id: id });

    if (!result || result === 0) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró la variante para eliminar', true);
    }

    return true;
  }
}
