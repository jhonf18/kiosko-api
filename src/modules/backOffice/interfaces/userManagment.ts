export interface IUpdateUser {
  name: string;
  password?: string;
  role: string;
  avatar?: string;
  branchOffice: string;
  active: boolean;
}
