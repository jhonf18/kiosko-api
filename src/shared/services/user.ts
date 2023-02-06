import { ICreateUser } from '../interfaces/ICreateUser';
import { UserRepository } from '../repository/user';
import { UserDocument } from '../schemas/user';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  public async createUser(user: ICreateUser) {
    return this.userRepo.saveUser(user);
  }

  public async findUsersById(id: string, get?: string) {
    return this.userRepo.getUsers({ nameField: 'id', valueField: id }, get);
  }

  public async findUserById(id: string, get?: string): Promise<UserDocument | null> {
    return this.userRepo.getUser({ nameField: 'id', valueField: id }, get);
  }

  public async findUserByEmail(email: string, get?: string) {
    return this.userRepo.getUser({ nameField: 'email', valueField: email }, get);
  }

  public async findUserByNickname(nickname: string, get?: string, getFullData?: boolean) {
    if (getFullData) {
      return this.userRepo.getUser({ nameField: 'nickname', valueField: nickname }, get, true);
    } else {
      return this.userRepo.getUser({ nameField: 'nickname', valueField: nickname }, get);
    }
  }

  public async findUserByRegex(regex: string) {
    return this.userRepo.findUsersByNicknameWithRegex(regex);
  }
}
