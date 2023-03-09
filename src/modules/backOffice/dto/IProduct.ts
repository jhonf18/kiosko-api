export interface IProductInput {
  name: string;
  mediaFiles?: Array<string>;
  price: number;
  active?: boolean;
  passageSections?: Array<string>;
  category: string;
  subcategory: string;
  branchOffice: string;
  selectedIngredients?: Array<ISelectedIngredients>;
}

interface ISelectedIngredients {
  ingredient: string;
  quantity: string;
}

export interface IUpdateProductInput {
  name: string;
  mediaFiles: Array<string>;
  price: number;
  active?: boolean;
  category: string;
  subcategory: string;
  branchOffice: string;
  passageSections?: Array<string>;
  selectedIngredients?: Array<ISelectedIngredients>;
}
