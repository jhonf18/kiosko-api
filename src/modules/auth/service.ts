import { v4 as uuidv4 } from 'uuid';
import { normalizeString } from './../../utilities/strings';

import { ApiError } from './../../config/errors/ApiError';
import { httpStatus } from './../../config/errors/httpStatusCodes';
import { UserService } from './../../shared/services/user';
import { ValidatorUser } from './../utils/validations';
import { creatUserInput } from './dto/signup';

export class AuthService {
  // private hashingPassword = new HashingPassword();

  constructor(private userService: UserService, private validatorUser: ValidatorUser) {}

  public async signup(userInput: creatUserInput) {
    const fields: Array<string> = ['name', 'email', 'password_1', 'password_2'];

    const validatorSignup = await this.validatorUser.Signup(userInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const id: string = uuidv4();
    const normalizeNickname = normalizeString(userInput.name);
    const nicknameLower = normalizeNickname.toLowerCase();
    const nicknameWithoutSpaces = nicknameLower.replace(/ /g, '');

    // TODO: generate nickname distinct
    // TODO: create password and add method in the model of user
    const nickname = nicknameWithoutSpaces;

    return this.userService.createUser({
      name: userInput.name,
      email: userInput.email,
      password: userInput.password_1,
      nickname,
      id
    });
  }
}
