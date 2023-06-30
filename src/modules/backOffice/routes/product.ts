import express from 'express';
import {
  createIngredientController,
  createProductController,
  createProductInAllBranchOfficesController,
  createVariantController,
  deleteIngredientController,
  deleteProductController,
  deleteVariantController,
  getIngredientsController,
  getProductController,
  getProductsController,
  getVariantsController,
  updateIngredientController,
  updateProductController,
  updateVariantController
} from '../controllers/product';

const routesProduct = express();

// Methods GET
routesProduct.get('/ingredients', getIngredientsController);
routesProduct.get('/variants', getVariantsController);
routesProduct.get('/products', getProductsController);
routesProduct.get('/product/:idProduct', getProductController);

// Methods POST
routesProduct.post('/create-ingredient', createIngredientController);
routesProduct.post('/create-variant', createVariantController);
routesProduct.post('/create-product', createProductController);
routesProduct.post('/create-product-in-all-branch-offices', createProductInAllBranchOfficesController);

// Methods PUT
routesProduct.put('/update-ingredient/:idIngredient', updateIngredientController);
routesProduct.put('/update-variant/:idVariant', updateVariantController);
routesProduct.put('/update-product/:idProduct', updateProductController);

// Methods DELETE
routesProduct.delete('/delete-ingredient/:idIngredient', deleteIngredientController);
routesProduct.delete('/delete-variant/:idVariant', deleteVariantController);
routesProduct.delete('/delete-product/:idProduct', deleteProductController);

export default routesProduct;
