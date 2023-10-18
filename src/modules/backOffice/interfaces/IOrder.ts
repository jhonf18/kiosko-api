export interface IOrder {
  id: string;
  name: String;
  selected_products: Array<ISelectedProduct>;
  comments?: string;
  total_price: number;
  is_open?: boolean;
  branch_office: string;
  waiter: string;
}

export interface ISelectedProduct {
  ticket_id?: string;
  product: string;
  ids_selected_ingredients?: Array<string>;
  comments?: string;
  passage_sections?: Array<string>;
  price?: number;
}

export interface IUpdateOrder {
  total_price?: number;
  selected_products?: Array<ISelectedProduct>;
  added_products?: Array<ISelectedProduct>;
  is_open?: boolean;
}
