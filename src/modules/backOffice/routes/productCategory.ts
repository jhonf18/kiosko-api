import express from 'express';
import {
  createCategoryController,
  getCategoriesController,
  updateCategoryController
} from './../controllers/productCategory';

const routesProductCategory = express();

// Methods GET
routesProductCategory.get('/categories', getCategoriesController);

// Methods POST
routesProductCategory.post('/create-category', createCategoryController);

// Methods PUT
routesProductCategory.put('/update-category/:idCategory', updateCategoryController);

export default routesProductCategory;
