import { v4 as uuidv4 } from 'uuid';
import { deleteFields } from '../../utils/deleteFields';
import { checkIsStringsArray, getIndexOfElmentInArray } from './../../../utilities/index';
import { BranchOfficeRepository } from './../repository/branchOffice';
import { ProductCategoryRepositoy } from './../repository/productCategory';

import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { isNotEmpty } from './../../utils/validations';
import { IProductInput, IUpdateProductInput } from './../dto/IProduct';
import { ProductRepository } from './../repository/product';

export class ProductManagmentService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly branchOfficeRepo: BranchOfficeRepository,
    private readonly productCategoryRepo: ProductCategoryRepositoy
  ) {}

  public async createProduct(productInput: IProductInput) {
    // validate fields
    const fields: Array<string> = ['name', 'price', 'category', 'branchOffice'];

    const validatorSignup = isNotEmpty(productInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    // Verify that price is a number
    if (typeof productInput.price !== 'number')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El precio del producto debe ser un número.', true);

    // Find BranchOffice
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: productInput.branchOffice }, 'id');

    if (!branchOfficeStore)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal con el id enviado', true);

    // Verify that the name category is Valid
    const categoryStore = await this.productCategoryRepo.findOne({ name: productInput.category }, 'name subcategories');
    if (!categoryStore)
      throw new ApiError(
        'Not Found Category',
        httpStatus.NOT_FOUND,
        'No se ha encontrado la categoria seleccionada.',
        true
      );

    // Verify that subcategories is valid
    if (typeof getIndexOfElmentInArray(categoryStore.subcategories, productInput.subcategory) === 'boolean')
      throw new ApiError(
        'Not Found Subcategory',
        httpStatus.NOT_FOUND,
        'La subcategoria seleccionada no es válida.',
        true
      );

    // TODO: Validate passing sections of product

    // Validate that media files are an array of strings
    if (productInput.mediaFiles && !checkIsStringsArray(productInput.mediaFiles))
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Los recursos multimedia del producto no son cadenas de texto.',
        true
      );

    const productRecord = await this.productRepo.save({
      id: uuidv4(),
      name: productInput.name,
      media_files: productInput.mediaFiles || [],
      price: productInput.price,
      active: productInput.active,
      category: productInput.category,
      subcategory: productInput.subcategory,
      branch_office: productInput.branchOffice,
      selected_ingredients: productInput.selectedIngredients || [],
      passage_sections: productInput.passageSections || [productInput.category]
    });

    return { product: deleteFields(productRecord) };
  }

  // TODO: Create filter for search in gets products

  public async getProduct(id: string, getData?: string) {
    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.productRepo.findOne({ id }, getData);
    } else {
      return await this.productRepo.findOne({ id });
    }
  }

  public async getProducts(filter?: Object, getData?: string) {
    getData = getData || '';
    const dataArray = getData.split(',');
    getData = dataArray.join(' ');
    return await this.productRepo.find(filter, getData);
  }

  public async deleteProduct(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const result = await this.productRepo.delete({ id: id });

    if (!result || result === 0)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró el producto para eliminar', true);

    return true;
  }

  public async updateProduct(id: string, updateProduct: IUpdateProductInput) {
    if (!id) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);

    const productStore = await this.productRepo.findOne({ id }, 'id');
    if (!productStore)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado el producto a editar', true);

    // validate fields
    const fields: Array<string> = ['name', 'price', 'category', 'branchOffice'];

    const validatorSignup = isNotEmpty(updateProduct, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    // Verify that price is a number
    if (typeof updateProduct.price !== 'number')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El precio del producto debe ser un número.', true);

    // Find BranchOffice
    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id: updateProduct.branchOffice }, 'id');
    if (!branchOfficeStore)
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal con el id enviado', true);

    // Verify that the name category is Valid
    const categoryStore = await this.productCategoryRepo.findOne(
      { name: updateProduct.category },
      'name subcategories'
    );
    if (!categoryStore)
      throw new ApiError(
        'Not Found Category',
        httpStatus.NOT_FOUND,
        'No se ha encontrado la categoria seleccionada.',
        true
      );

    // Verify that subcategories is valid
    if (typeof getIndexOfElmentInArray(categoryStore.subcategories, updateProduct.subcategory) === 'boolean')
      throw new ApiError(
        'Not Found Subcategory',
        httpStatus.NOT_FOUND,
        'La subcategoria seleccionada no es válida.',
        true
      );

    // Validate that media files are an array of strings
    if (updateProduct.mediaFiles && !checkIsStringsArray(updateProduct.mediaFiles))
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Los recursos multimedia del producto no son cadenas de texto.',
        true
      );

    const productRecord = await this.productRepo.update(
      { id: productStore.id },
      {
        name: updateProduct.name,
        media_files: updateProduct.mediaFiles || [],
        price: updateProduct.price,
        category: updateProduct.category,
        subcategory: updateProduct.subcategory,
        branch_office: updateProduct.branchOffice,
        selected_ingredients: updateProduct.selectedIngredients || [],
        passage_sections: updateProduct.passageSections || [updateProduct.category]
      }
    );

    return { product: productRecord };
  }
}
