import { UserService } from './../../shared/services/user';
import { creatUserInput } from './dto/signup';

export class AuthService {
  constructor(private userService: UserService) {}
  public async signup(_userInput: creatUserInput) {
    return this.userService.createUser({
      id: 's',
      name: 's',
      nickname: 's',
      email: 's',
      password: 's',
      avatar: 's'
    });
  }
}
