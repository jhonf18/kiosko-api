export interface createBranchOfficeInput {
  name: string;
  address: string;
  employees?: Array<string>;
  leaders?: Array<string>;
}

export interface updateBranchOfficeInput {
  name: string;
  address: string;
  employees?: Array<string>;
  leaders?: Array<string>;
}
