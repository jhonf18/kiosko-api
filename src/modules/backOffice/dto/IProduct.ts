export interface IProductInput {
  name: string;
  media_files?: Array<string>;
  price: number;
  active?: boolean;
  passageSections?: Array<string>;
  category: string;
  subcategory: string;
  branchOffice: string;
  variants?: Array<string>;
}

export interface IUpdateProductInput {
  name: string;
  media_files: Array<string>;
  price: number;
  active?: boolean;
  category: string;
  subcategory: string;
  branchOffice: string;
  variants?: Array<string>;
  passageSections?: Array<string>;
}
