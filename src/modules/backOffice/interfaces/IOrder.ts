export interface IOrder {
  id: string;
  products?: Array<{ product_id: string; variant?: string; comments?: string }>;
  custom_products?: Array<ICustomProduct>;
  comments?: Array<{ id_product: string; comment: string }>;
  total_price: number;
  is_open?: boolean;
  branch_office: string;
  waiter: string;
}

export interface ICustomProduct {
  name: string;
  variant: any;
  price: number;
  ingredients?: any[];
  comments?: string;
  sections: string[];
}

export interface IUpdateOrder {
  is_open: boolean;
}
