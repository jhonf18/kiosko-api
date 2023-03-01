import * as awilix from 'awilix';
import { container } from '../../shared';
import { BranchOfficeRepository } from './repository/branchOffice';
import { DishVariantRepository } from './repository/dishVariant';
import { IngredientRepository } from './repository/ingredient';
import { ProductRepository } from './repository/product';
import { ProductCategoryRepositoy } from './repository/productCategory';
import { DishVariantModel } from './schemas/dishVariant';
import { IngredientModel } from './schemas/ingredients';
import { ProductModel } from './schemas/product';
import { ProductCategoryModel } from './schemas/productCategory';
import { BranchOfficeService } from './services/BranchOffice';
import { DishVariantService } from './services/DishVariant';
import { IngredientService } from './services/Ingredient';
import { ProductManagmentService } from './services/Product';
import { ProductCategoryService } from './services/ProductCategory';
import { UserServiceManagment } from './services/UserManagment';

container.register({
  branchOfficeService: awilix.asClass(BranchOfficeService),
  branchOfficeRepo: awilix.asClass(BranchOfficeRepository),
  userServiceManagment: awilix.asClass(UserServiceManagment),
  // Dependencies of module Ingredients
  ingredientStore: awilix.asValue(IngredientModel),
  ingredientRepo: awilix.asClass(IngredientRepository),
  ingredientService: awilix.asClass(IngredientService),
  // Dependencies of module Dish Variants
  dishVariantStore: awilix.asValue(DishVariantModel),
  dishVariantRepo: awilix.asClass(DishVariantRepository),
  dishVariantService: awilix.asClass(DishVariantService),
  // Dependencies of module Product
  productStore: awilix.asValue(ProductModel),
  productRepo: awilix.asClass(ProductRepository),
  productService: awilix.asClass(ProductManagmentService),
  // Dependencies of module Category
  productCategoryStore: awilix.asValue(ProductCategoryModel),
  productCategoryRepo: awilix.asClass(ProductCategoryRepositoy),
  productCategoryService: awilix.asClass(ProductCategoryService)
});

export const branchOfficeService: BranchOfficeService = container.resolve('branchOfficeService');
export const userServiceManagment: UserServiceManagment = container.resolve('userServiceManagment');
export const ingredientService: IngredientService = container.resolve('ingredientService');
export const dishVariantService: DishVariantService = container.resolve('dishVariantService');
export const productManagmentService: ProductManagmentService = container.resolve('productService');
export const productCategoryService: ProductCategoryService = container.resolve('productCategoryService');
