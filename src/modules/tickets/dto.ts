export interface ICreateOrderInput {
  selectedProducts: Array<ISelectedProductInput>;
  comments?: string;
  totalPrice: number;
  isOpen?: boolean;
  branchOffice: string;
  waiter: string;
}

export interface ISelectedProductInput {
  product: string;
  ids_selected_ingredients?: Array<string>;
  comments?: string;
}

export interface ICustomProductInput {
  name: string;
  variant: any;
  price: number;
  ingredients?: any[];
  comments?: string;
  sections: string[];
}
