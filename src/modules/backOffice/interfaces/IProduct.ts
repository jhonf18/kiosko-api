export interface IProduct {
  id: string;
  name: string;
  media_files?: Array<string>;
  price: number;
  active?: boolean;
  category: string;
  subcategory: string;
  branch_office: string;
  variants?: Array<string>;
  passage_sections?: Array<string>;
}

export interface IUpdateProduct {
  name: string;
  media_files?: Array<string>;
  price: number;
  category: string;
  subcategory: string;
  active?: boolean;
  branch_office: string;
  variants?: Array<string>;
  passage_sections: Array<string>;
}
