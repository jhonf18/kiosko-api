import { ICreateUser } from '../interfaces/ICreateUser';
import { UserRepository } from './../dao/user';

export class UserService {
  constructor(private userRepository: UserRepository) {}
  public async createUser(_user: ICreateUser) {
    return this.userRepository.saveUser();
  }
}
