import { NextFunction, Request, Response } from 'express';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';
import { dishVariantService, ingredientService, productManagmentService } from './../dependencyInjector';

// Controllers of type GET

export const getIngredientsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ingredientService.getIngredients(req.query.get as string);
    if (!data) {
      return response(null, 'No se encontrarón ingredientes.', httpStatus.OK, res);
    }

    return response([...data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const getVariantsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dishVariantService.getVariants(req.query.get as string);
    if (!data) {
      return response(null, 'No se encontraron variantes.', httpStatus.OK, res);
    }

    return response([...data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await productManagmentService.getProduct(req.params.idProduct, req.query.get as string);
    if (!data) {
      return response(
        null,
        'No se encontró el producto con el id asociado ' + req.params.idProduct,
        httpStatus.OK,
        res
      );
    }

    return response([data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const getProductsController = async (req: Request, res: Response, next: NextFunction) => {
  let filter = JSON.parse(JSON.stringify(req.query));
  delete filter.get;

  try {
    const data = await productManagmentService.getProducts(filter, req.query.get as string);
    if (!data) {
      return response(null, 'No se encontraron productos.', httpStatus.OK, res);
    }

    return response([...data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type POST

export const createIngredientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ingredient } = await ingredientService.createIngredient({
      name: req.body.name,
      type: req.body.type
    });

    response(ingredient, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const createVariantController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await dishVariantService.createVariant({
      name: req.body.name,
      ingredients: req.body.ingredients
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product } = await productManagmentService.createProduct({
      name: req.body.name,
      mediaFiles: req.body.media_files,
      selectedIngredients: req.body.selected_ingredients,
      price: req.body.price,
      active: req.body.active,
      category: req.body.category,
      passageSections: req.body.passage_sections,
      subcategory: req.body.subcategory,
      branchOffice: req.body.branch_office
    });

    response(product, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const createProductInAllBranchOfficesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const { products } = await productManagmentService.createProductInAllBranchOffices({
      name: req.body.name,
      mediaFiles: req.body.media_files,
      selectedIngredients: req.body.selected_ingredients,
      price: req.body.price,
      active: req.body.active,
      category: req.body.category,
      passageSections: req.body.passage_sections,
      subcategory: req.body.subcategory,
      branchOffice: req.body.branch_office
    });

    response(products, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type PUT

export const updateIngredientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ingredient } = await ingredientService.updateIngredient(req.params.idIngredient, {
      name: req.body.name,
      type: req.body.type
    });

    response(ingredient, 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const updateVariantController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await dishVariantService.updateVariant(req.params.idVariant, {
      name: req.body.name,
      ingredients: req.body.ingredients
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product } = await productManagmentService.updateProduct(req.params.idProduct, {
      name: req.body.name,
      mediaFiles: req.body.media_files,
      price: req.body.price,
      active: req.body.active,
      category: req.body.category,
      subcategory: req.body.subcategory,
      branchOffice: req.body.branch_office,
      passageSections: req.body.passage_sections,
      selectedIngredients: req.body.selected_ingredients
    });

    response(product, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

// Controllers of type DELETE

export const deleteIngredientController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ingredientService.deleteIngredient(req.params.idIngredient);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const deleteVariantController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dishVariantService.deleteVariant(req.params.idVariant);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productManagmentService.deleteProduct(req.params.idProduct);

    return response(null, 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};
