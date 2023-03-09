import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { getObjectFromArray } from './../../../utilities/index';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { IProduct, IUpdateProduct } from './../interfaces/IProduct';
import { BranchOfficeModel } from './../schemas/branchOffice';
import { DishVariantModel } from './../schemas/dishVariant';
import { ProductModel } from './../schemas/product';
import { BranchOfficeRepository } from './branchOffice';
import { IngredientRepository } from './ingredient';

/* It's an interface that defines the structure of the selected ingredients array. */
interface ISelectedIngredient {
  ingredient: string;
  quantity: string;
}

export class ProductRepository {
  constructor(
    private readonly productStore: typeof ProductModel,
    private readonly ingredientRepo: IngredientRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository
  ) {}

  /**
   * We are saving a product, but before saving it, we need to find the branch office and the selected
   * ingredients for add _ids
   * @param {IProduct} product - IProduct
   * @returns The productStore.save() method returns a promise.
   */
  public async save(product: IProduct) {
    // Search Branch Office from Id and get _id to save them in the database with product store
    const branchOfficeStorePromise = this.branchOfficeRepo.findOne({ id: product.branch_office }, '_id', true);
    const selectedIngredientsPromise = this.prepareIngredientsToSave(product.selected_ingredients);

    const [branchOfficeStore, selectedIngredients] = await Promise.all([
      branchOfficeStorePromise,
      selectedIngredientsPromise
    ]);

    product.branch_office = branchOfficeStore!._id;
    product.selected_ingredients = selectedIngredients;

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

  /**
   * It's a function that returns a promise that resolves to a product document from the database
   * @param {Object} [conditions] - Object with the conditions to find the product.
   * @param {string} [getData] - string
   * @param {boolean} [getKeyID] - boolean
   * @returns The product that matches the conditions.
   */
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

  /**
   * It returns a list of products that match the conditions passed as a parameter
   * @param {Object | null} [conditions] - Object | null
   * @param {string} [getData] - string
   * @param {boolean} [getKeyID] - boolean
   * @returns The result of the query.
   */
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

  /**
   * It deletes a product from the database
   * @param {Object} conditions - Object
   * @returns The number of deleted documents.
   */
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

  /**
   * It updates a product in the database
   * @param {Object} conditions - Object
   * @param {IUpdateProduct} product - IUpdateProduct
   * @returns The updated product.
   */
  public async update(conditions: Object, product: IUpdateProduct) {
    const branchOfficeStorePromise = this.branchOfficeRepo.findOne({ id: product.branch_office }, '_id', true);
    const selectedIngredientsPromise = this.prepareIngredientsToSave(product.selected_ingredients);

    const [branchOfficeStore, selectedIngredients] = await Promise.all([
      branchOfficeStorePromise,
      selectedIngredientsPromise
    ]);

    product.branch_office = branchOfficeStore!._id;
    product.selected_ingredients = selectedIngredients;

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

  /**
   * It takes an array of selected ingredients, finds the ingredients in the database, and returns an
   * array of selected ingredients with the ingredient object replaced by the ingredient's _id
   * @param selectedIngredients - Array<ISelectedIngredient>
   * @returns An array of objects with the ingredient id and quantity.
   */
  private async prepareIngredientsToSave(selectedIngredients: Array<ISelectedIngredient>) {
    const ingredientsID = selectedIngredients.map(selected => selected.ingredient);
    const ingredients = await this.ingredientRepo.findIngredientsFromArrayWithMultiplesIDS(ingredientsID, '_id id');

    let selectedIngredientsReadyToSave = [];
    for (const ingredient of ingredients) {
      const ingredientWithCommentsAndQuantity = getObjectFromArray(
        selectedIngredients,
        'ingredient',
        ingredient.id
      ) as ISelectedIngredient;
      selectedIngredientsReadyToSave.push({
        ingredient: ingredient._id,
        quantity: ingredientWithCommentsAndQuantity.quantity
      });
    }

    return selectedIngredientsReadyToSave;
  }
}
