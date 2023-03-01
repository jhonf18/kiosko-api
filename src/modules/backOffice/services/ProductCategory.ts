import { v4 as uuidv4 } from 'uuid';

import { ApiError } from '../../../config/errors/ApiError';
import { httpStatus } from '../../../config/errors/httpStatusCodes';
import { deleteFields } from '../../utils/deleteFields';
import { isNotEmpty } from '../../utils/validations';
import { ProductCategoryRepositoy } from '../repository/productCategory';

interface ICategoryOfProductInput {
  name: string;
  subcategories: string[];
}

export class ProductCategoryService {
  constructor(private readonly productCategoryRepo: ProductCategoryRepositoy) {}

  public async createCategoryOfProduct(categoryInput: ICategoryOfProductInput) {
    // validate fields
    const fields: Array<string> = ['name'];

    const validatorSignup = isNotEmpty(categoryInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const categoryRecord = await this.productCategoryRepo.save({
      id: uuidv4(),
      name: categoryInput.name,
      subcategories: categoryInput.subcategories
    });

    return { category: deleteFields(categoryRecord) };
  }

  public async getCategoriesOfProducts(getData?: string) {
    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.productCategoryRepo.find(null, getData);
    } else {
      return await this.productCategoryRepo.find(null);
    }
  }

  public async updateCategory(id: string, categoryInput: ICategoryOfProductInput) {
    if (!categoryInput.name || categoryInput.name.length === 0)
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'Debes ingresar un nombre para la categoria', true);

    if (!id) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    const categoryStore = await this.productCategoryRepo.find({ id }, 'id');
    if (categoryStore.length === 0)
      throw new ApiError(
        'Not Found Category',
        httpStatus.NOT_FOUND,
        'No se ha encontrado la categoria que se quiere actualizar.',
        true
      );

    const categoryRecord = await this.productCategoryRepo.update(
      { id },
      {
        name: categoryInput.name,
        subcategories: categoryInput.subcategories
      }
    );

    return { category: deleteFields(categoryRecord!) };
  }
}
