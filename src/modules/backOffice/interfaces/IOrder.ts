export interface IOrder {
  id: string;
  selected_products: Array<ISelectedProduct>;
  comments?: string;
  total_price: number;
  is_open?: boolean;
  branch_office: string;
  waiter: string;
}

export interface ISelectedProduct {
  product: string;
  ids_selected_ingredients?: Array<string>;
  comments?: string;
  passage_sections?: Array<string>;
}

export interface IUpdateOrder {
  total_price?: number;
  selected_products?: Array<ISelectedProduct>;
  added_products?: Array<ISelectedProduct>;
  is_open?: boolean;
}
