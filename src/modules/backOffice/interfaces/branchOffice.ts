export interface IBranchOffice {
  id: string;
  name: string;
  address: string;
  employees?: Array<string>;
}

export interface IUpdateBranchOffice {
  employees?: Array<string>;
}
