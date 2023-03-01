export interface IDishVariant {
  id: string;
  name: string;
  ingredients?: Array<string>;
}

export interface IUpdateDishVariant {
  name: string;
  ingredients: Array<string>;
}
