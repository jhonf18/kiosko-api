import { v4 as uuidv4 } from 'uuid';
import { getIndexOfElmentInArray } from './../../../utilities/index';

import { typesOfIngredients } from '../../../shared/config/typeOfIngredient';
import { deleteFields } from '../../utils/deleteFields';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { isNotEmpty } from './../../utils/validations';
import { ICreateIngredientInput, IUpdateIngredientInput } from './../dto/ingredient';
import { IngredientRepository } from './../repository/ingredient';

export class IngredientService {
  constructor(private readonly ingredientRepo: IngredientRepository) {}

  public async createIngredient(ingredientInput: ICreateIngredientInput) {
    // validate fields
    const fields: Array<string> = ['name', 'type'];

    const validatorSignup = isNotEmpty(ingredientInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    // Validate type of ingredient
    if (typeof getIndexOfElmentInArray(typesOfIngredients, ingredientInput.type) === 'boolean')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El tipo de ingrediente no es válido', true);

    const ingredientRecord = await this.ingredientRepo.save({
      name: ingredientInput.name,
      type: ingredientInput.type,
      id: uuidv4()
    });

    return { ingredient: deleteFields(ingredientRecord) };
  }

  public async getIngredients(getData?: string) {
    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.ingredientRepo.find(getData);
    } else {
      return await this.ingredientRepo.find();
    }
  }

  public async updateIngredient(id: string, updateIngredientInput: IUpdateIngredientInput) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    // Validate type of ingredient
    if (typeof getIndexOfElmentInArray(typesOfIngredients, updateIngredientInput.type) === 'boolean')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El tipo de ingrediente no es válido', true);

    const ingredientStore = await this.ingredientRepo.findOne({ id }, 'id');

    if (!ingredientStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado el ingrediente a editar', true);
    }

    const ingredientRecord = await this.ingredientRepo.update({ id: ingredientStore.id }, updateIngredientInput);

    return { ingredient: ingredientRecord };
  }

  public async deleteIngredient(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const result = await this.ingredientRepo.delete({ id: id });

    if (!result || result === 0) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró el ingrediente para eliminar', true);
    }

    return true;
  }
}
