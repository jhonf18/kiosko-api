import { ApiError } from '../../../config/errors/ApiError';
import { httpStatus } from '../../../config/errors/httpStatusCodes';
import { ProductCategoryModel } from '../schemas/productCategory';

interface ICategoryOfProduct {
  id?: string;
  name: string;
  subcategories: string[];
}

export class ProductCategoryRepositoy {
  constructor(private readonly productCategoryStore: typeof ProductCategoryModel) {}

  public async save(category: ICategoryOfProduct) {
    const categoryStore = new this.productCategoryStore(category);

    try {
      return await categoryStore.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la categoria.',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, category: ICategoryOfProduct) {
    try {
      return await this.productCategoryStore.findOneAndUpdate(conditions, category, {
        new: true
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la categoria.',
        true,
        error.message
      );
    }
  }

  public async find(conditions: Object | null, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.productCategoryStore.find(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener las categorias',
        true,
        error.message
      );
    }
  }

  public async findOne(conditions: Object | null, getData?: string) {
    conditions = conditions || {};
    try {
      return await this.productCategoryStore.findOne(conditions, getData);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener las categoria',
        true,
        error.message
      );
    }
  }
}
