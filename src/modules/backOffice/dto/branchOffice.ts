export interface createBranchOfficeInput {
  name: string;
  address: string;
  employees?: Array<string>;
}

export interface updateBranchOfficeInput {
  name?: string;
  address?: string;
  employees?: Array<string>;
}
