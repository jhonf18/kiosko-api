import { ICreateUser } from '../interfaces/ICreateUser';
import { UserRepository } from '../repository/user';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  public async createUser(user: ICreateUser) {
    return this.userRepository.saveUser(user);
  }

  public async findUserByEmail(email: string, get?: string) {
    return this.userRepository.getUser({ nameField: 'email', valueField: email }, get);
  }
}
