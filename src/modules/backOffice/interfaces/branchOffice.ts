export interface IBranchOffice {
  id: string;
  name: string;
  address: string;
  employees?: Array<string>;
  leaders?: Array<string>;
}

export interface IUpdateBranchOffice {
  name: string;
  address: string;
  employees?: Array<string>;
  leaders?: Array<string>;
}
