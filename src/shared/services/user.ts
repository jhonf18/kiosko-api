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

  public async findUserByNickname(nickname: string, get?: string, getFullData?: boolean) {
    if (getFullData) {
      return this.userRepository.getUser({ nameField: 'nickname', valueField: nickname }, get, true);
    } else {
      return this.userRepository.getUser({ nameField: 'nickname', valueField: nickname }, get);
    }
  }

  public async findUserByRegex(regex: string) {
    return this.userRepository.findUsersByNicknameWithRegex(regex);
  }
}
