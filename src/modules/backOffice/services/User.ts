import { IUpdateUser } from './../interfaces/userManagment';
// import { UserRepository } from './../../../shared/repository/user';
export class UserServiceManagment {
  // constructor(private userRepo: UserRepository) {}

  public async updateUser(_id: string, _userInput: IUpdateUser) {}
  public async deleteUser(_id: string) {}
}
