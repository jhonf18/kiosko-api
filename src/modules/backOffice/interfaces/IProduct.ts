export interface IProduct {
  id: string;
  name: string;
  media_files?: Array<string>;
  price: number;
  active?: boolean;
  category: string;
  subcategory: string;
  branch_office: string;
  selected_ingredients: Array<ISelectedIngredients>;
  passage_sections: Array<string>;
}

interface ISelectedIngredients {
  ingredient: string;
  quantity: string;
}

export interface IUpdateProduct {
  name: string;
  media_files?: Array<string>;
  price: number;
  category: string;
  subcategory: string;
  active?: boolean;
  branch_office: string;
  passage_sections: Array<string>;
  selected_ingredients: Array<ISelectedIngredients>;
}
