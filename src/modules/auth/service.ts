import { v4 as uuidv4 } from 'uuid';
import { ROLES } from './../../shared/config/roles';
import { normalizeString } from './../../utilities/strings';
import { generateNickName } from './../utils/nickname';
import { generateToken } from './../utils/tokens';
import { loginUserInput } from './dto/signin';

import { deleteFields } from '../utils/deleteFields';
import { HashingPassword } from '../utils/hashingPassword';
import { ValidatorUser } from '../utils/validationsUser';
import { ApiError } from './../../config/errors/ApiError';
import { httpStatus } from './../../config/errors/httpStatusCodes';
import { UserService } from './../../shared/services/user';
import { creatUserInput } from './dto/signup';
import { BlackListRepository } from './repository/blackList';

export class AuthService {
  private hashingPassword = new HashingPassword();

  constructor(
    private userService: UserService,
    private validatorUser: ValidatorUser,
    private blackListRepo: BlackListRepository
  ) {}

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

    const password = await this.hashingPassword.encryptPassword(userInput.password_1);
    const nickname = await generateNickName(nicknameWithoutSpaces, this.userService, id);

    const userRecord = await this.userService.createUser({
      name: userInput.name,
      email: userInput.email,
      password,
      nickname,
      id,
      role: ROLES.WAITER
    });

    const token = generateToken(id);
    const userToClient = deleteFields(userRecord, ['password']);

    return { token, user: userToClient };
  }

  public async signin(userInput: loginUserInput, _admin?: boolean) {
    const fields: Array<string> = ['password', 'nickname'];

    const validatorSignup = await this.validatorUser.Signup(userInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const userStore = await this.userService.findUserByNickname(userInput.nickname, undefined, true);
    if (!userStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'Email o contraseña incorrectos', true);
    }

    // if (!admin && userStore.role === 'ROLE_ADMIN') {
    //   throw new ApiError('Forbiden', httpStatus.FORBIDDEN, 'No es posible acceder a este sitio', true);
    // }

    const comparePassword = await this.hashingPassword.comparePassword(userStore.password, userInput.password);
    if (!comparePassword) {
      throw new ApiError('Unauthorized', httpStatus.UNAUTHORIZED, 'Email o contraseña incorrectos', true);
    }

    const token = generateToken(userStore.id);
    const userToClient = deleteFields(userStore, ['password']);

    return { token, user: userToClient };
  }

  public async signout(idToken: string) {
    await this.blackListRepo.saveToken(idToken);
  }
}
