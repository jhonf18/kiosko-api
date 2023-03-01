export interface ICreateIngredientInput {
  name: string;
  type: string;
}

export interface IUpdateIngredientInput extends ICreateIngredientInput {}
