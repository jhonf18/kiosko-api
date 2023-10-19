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
    const categoryStore = await this.productCategoryRepo.findOne({ id: productInput.category }, 'name subcategories');
    if (!categoryStore)
      throw new ApiError(
        'Not Found Category',
        httpStatus.NOT_FOUND,
        'No se ha encontrado la categoria seleccionada.',
        true
      );

    // Verify that subcategories is valid
    if (!categoryStore.subcategories.includes(productInput.subcategory))
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
      category: categoryStore.name,
      subcategory: productInput.subcategory,
      branch_office: productInput.branchOffice,
      selected_ingredients: productInput.selectedIngredients || [],
      passage_sections: productInput.passageSections || [categoryStore.name],
      can_change_price: productInput.canChangePrice || false
    });

    const productWithoutFieldsImportants = deleteFields(productRecord);

    return { product: this.formatProductForSend([productWithoutFieldsImportants])[0] };
  }

  public async createProductInAllBranchOffices(productInput: IProductInput) {
    // validate fields
    const fields: Array<string> = ['name', 'price', 'category'];

    const validatorSignup = isNotEmpty(productInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    // Verify that price is a number
    if (typeof productInput.price !== 'number')
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El precio del producto debe ser un número.', true);

    // Verify that the name category is Valid
    const categoryStore = await this.productCategoryRepo.findOne({ id: productInput.category }, 'name subcategories');
    if (!categoryStore)
      throw new ApiError(
        'Not Found Category',
        httpStatus.NOT_FOUND,
        'No se ha encontrado la categoria seleccionada.',
        true
      );

    // Verify that subcategories is valid
    if (!categoryStore.subcategories.includes(productInput.subcategory))
      throw new ApiError(
        'Not Found Subcategory',
        httpStatus.NOT_FOUND,
        'La subcategoria seleccionada no es válida.',
        true
      );

    // Validate that media files are an array of strings
    if (productInput.mediaFiles && !checkIsStringsArray(productInput.mediaFiles))
      throw new ApiError(
        'Bad Request',
        httpStatus.BAD_REQUEST,
        'Los recursos multimedia del producto no son cadenas de texto.',
        true
      );

    const branchOffices = await this.branchOfficeRepo.find('id');
    const products = [];

    for (const branchOffice of branchOffices) {
      const productToSave = {
        id: uuidv4(),
        name: productInput.name,
        media_files: productInput.mediaFiles || [],
        price: productInput.price,
        active: productInput.active,
        category: categoryStore.name,
        subcategory: productInput.subcategory,
        branch_office: branchOffice.id,
        selected_ingredients: productInput.selectedIngredients || [],
        passage_sections: productInput.passageSections || [categoryStore.name],
        can_change_price: productInput.canChangePrice || false
      };

      const productRecord = await this.productRepo.save(productToSave);

      const productWithoutFieldsImportants = deleteFields(productRecord);
      products.push(productWithoutFieldsImportants);
    }

    return {
      products: this.formatProductForSend(products)
    };
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
    const products = (await this.productRepo.find(filter, getData)) as any;
    return this.formatProductForSend(products);
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

    const productStore = await this.productRepo.findOne({ id }, 'id media_files');
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
    const categoryStore = await this.productCategoryRepo.findOne({ id: updateProduct.category }, 'name subcategories');
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

    // TODO: Delete (update) images from cloudinary
    if (updateProduct.mediaFiles.length === 0) updateProduct.mediaFiles = productStore.media_files || [];

    const productRecord = await this.productRepo.update(
      { id: productStore.id },
      {
        name: updateProduct.name,
        media_files: updateProduct.mediaFiles || [],
        price: updateProduct.price,
        category: categoryStore.name,
        subcategory: updateProduct.subcategory,
        branch_office: updateProduct.branchOffice,
        selected_ingredients: updateProduct.selectedIngredients || [],
        passage_sections: updateProduct.passageSections || [categoryStore.name],
        can_change_price: updateProduct.canChangePrice || false
      }
    );

    return { product: this.formatProductForSend([productRecord])[0] };
  }

  private formatProductForSend(products: any[]) {
    products = JSON.parse(JSON.stringify(products));
    const productsForSend = products.map((e: any) => {
      const ingredients = e.selected_ingredients.map((i: any) => {
        if (i.quantity) {
          return { ...i.ingredient, quantity: i.quantity };
        } else {
          return { ...i.ingredient };
        }
      });

      return { ...e, selected_ingredients: ingredients };
    });

    return productsForSend;
  }
}
