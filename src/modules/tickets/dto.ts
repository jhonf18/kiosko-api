export interface ICreateOrder {
  products: Array<{ product_id: string; variant?: string }>;
  comments?: Array<{ id_product: string; comment: string }>;
  totalPrice: number;
  isOpen?: boolean;
  branchOffice: string;
  customProducts: Array<ICustomProductInput>;
  waiter: string;
}

export interface ICustomProductInput {
  name: string;
  variant: any;
  price: number;
  ingredients?: any[];
  comments?: string;
  sections: string[];
}
