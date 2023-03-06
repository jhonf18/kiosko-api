import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { IProduct, IUpdateProduct } from './../interfaces/IProduct';
import { BranchOfficeModel } from './../schemas/branchOffice';
import { DishVariantModel } from './../schemas/dishVariant';
import { ProductModel } from './../schemas/product';
import { BranchOfficeRepository } from './branchOffice';
import { DishVariantRepository } from './dishVariant';

export class ProductRepository {
  constructor(
    private readonly productStore: typeof ProductModel,
    private readonly dishVariantRepo: DishVariantRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository
  ) {}

  public async save(product: IProduct) {
    // Search Branch Office from Id and get _id to save them in the database with product store

    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: product.branch_office }, '_id', true);
    product.branch_office = branchOfficeStore!._id;

    // Search the variants by Id and then get the _ids to save them in the database with product
    if (product.variants) {
      const variants = await this.dishVariantRepo.findVariantFromArrayIdsToIdkey(product.variants);
      product.variants = variants;
    }

    if (typeof product.active === 'undefined') product.active = true;

    // Create product store and then save it in database
    const productStore = new this.productStore(product);

    try {
      return await productStore.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear el producto.',
        true,
        error.message
      );
    }
  }

  public async findOne(conditions?: Object, getData?: string, getKeyID?: boolean) {
    conditions = conditions || {};
    let populate = [];

    if (getData) {
      const parametrizationSearchParams = !getKeyID
        ? parameterizeSearchWithParams(getData, 'password _id __v', '-_id')
        : parameterizeSearchWithParams(getData, 'password _id __v');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'branch_office') {
            populate.model = BranchOfficeModel;
          } else if (populate.path === 'variants') {
            populate.model = DishVariantModel;
          }
          populate.select += '-_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '';
    }

    try {
      return await this.productStore.findOne(conditions, getData).populate(populate);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener el producto.',
        true,
        error.message
      );
    }
  }

  public async find(conditions?: Object | null, getData?: string, getKeyID?: boolean) {
    conditions = conditions || {};
    let populate = [];

    if (getData) {
      const parametrizationSearchParams = !getKeyID
        ? parameterizeSearchWithParams(getData, '_id __v', '-_id')
        : parameterizeSearchWithParams(getData, '_id __v');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'branch_office') {
            populate.model = BranchOfficeModel;
          } else if (populate.path === 'variants') {
            populate.model = DishVariantModel;
          }
          populate.select += '-_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '';
    }

    try {
      return await this.productStore.find(conditions, getData).populate(populate);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener los productos.',
        true,
        error.message
      );
    }
  }

  public async delete(conditions: Object) {
    try {
      const result = await this.productStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar el producto.',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, product: IUpdateProduct) {
    // Add BranchOffice _id to collection
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: product.branch_office }, '_id');
    product.branch_office = branchOfficeStore!._id;

    // If there variants for save in DB
    if (product.variants) {
      // Get _ids of the variants passing ID
      const variants = await this.dishVariantRepo.findVariantFromArrayIdsToIdkey(product.variants);
      product.variants = variants;
    }

    try {
      return await this.productStore.findOneAndUpdate(conditions, product, {
        new: true
      });
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar el producto.',
        true,
        error.message
      );
    }
  }

  public async findProductsFromArrayIdsToIdkey(array: Array<string>) {
    let _ids = [];

    for await (const id of array) {
      const product = await this.findOne({ id: id }, '_id', true);
      if (!product) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'No se ha encontrado el id del del producto al buscar.',
          true,
          'No se ha encontrado el _id del producto al buscar, path:/ProductRepository/findUsersFromArrayIdsToIdkey'
        );
      }
      _ids.push(product?._id);
    }

    return _ids;
  }

  public async findProductsFromArrayWithMultipleIDS(idsArray: Array<string>, getData?: string) {
    let arrayForSearch = [];
    for (const id of idsArray) {
      arrayForSearch.push({ id });
    }

    try {
      return await this.productStore.find({ $or: arrayForSearch }, getData);
    } catch (err: any) {
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Ha ocurrido un error al obtener los productos.',
        true,
        err.message
      );
    }
  }
}
