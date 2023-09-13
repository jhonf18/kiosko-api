import { v4 as uuidv4 } from 'uuid';
import { ROLES } from './../../shared/config/roles';
import { normalizeString } from './../../utilities/strings';
import { generateNickName } from './../utils/nickname';
import { generateToken } from './../utils/tokens';
import { loginUserInput } from './dto/signin';

import { getKeyByValue } from '../../utilities';
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

  /**
   * It validates the input, creates a user ID, creates a nickname, hashes the password, saves the user
   * in the database, generates a token and returns the token and the user
   * @param {creatUserInput} userInput - creatUserInput
   * @returns The token and the user
   */
  public async signup(userInput: creatUserInput) {
    // Validate fields
    const fields: Array<string> = ['name', 'email', 'password_1', 'password_2', 'role', 'branchOffice'];

    const validatorSignup = await this.validatorUser.Signup(userInput, fields, false);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    // Validate that the role sent is among the available ones and that it is different from admin
    const roleFound = getKeyByValue(ROLES, userInput.role);
    if (!roleFound || roleFound === 'ROLE_ADMIN') {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El rol no es correcto', true);
    }

    // Create user ID and create nickname
    const id: string = uuidv4();
    const normalizeNickname = normalizeString(userInput.name);
    const nicknameLower = normalizeNickname.toLowerCase();
    const nicknameWithoutSpaces = nicknameLower.replace(/ /g, '');
    const nickname = await generateNickName(nicknameWithoutSpaces, this.userService, id);

    // Hashing password
    const password = await this.hashingPassword.encryptPassword(userInput.password_1);

    // Save user in DB
    const userRecord = await this.userService.createUser({
      name: userInput.name,
      email: userInput.email,
      password,
      nickname,
      id,
      role: userInput.role,
      branchOffice: userInput.branchOffice
    });

    // Generate token and remove fields that will no be sent to the client
    const token = generateToken({ id });
    const userToClient = deleteFields(userRecord, ['password']);

    return { token, user: userToClient };
  }

  /**
   * It takes in a userInput object, an optional _admin boolean, and an optional getData string, and
   * returns a Promise that resolves to an object with a token property
   * @param {loginUserInput} userInput - loginUserInput
   * @param {boolean} [_admin] - boolean
   * @param {string} [getData] - This is the data that you want to get from the user.
   * @returns The token
   */
  public async signin(userInput: loginUserInput, _admin?: boolean, getData?: string) {
    getData = getData || '';
    const getDataArray = getData.split(',');
    getData = getDataArray.join(' ');

    const fields: Array<string> = ['password', 'nickname'];

    const validatorSignup = await this.validatorUser.Signup(userInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const userStore = await this.userService.findUserByNickname(
      userInput.nickname,
      `${getData} password branch_office.id id role`,
      true
    );
    if (!userStore) {
      throw new ApiError('Unauthorized', httpStatus.UNAUTHORIZED, 'Email o contraseña incorrectos', true);
    }

    // if (!admin && userStore.role === 'ROLE_ADMIN') {
    //   throw new ApiError('Forbiden', httpStatus.FORBIDDEN, 'No es posible acceder a este sitio', true);
    // }

    const comparePassword = await this.hashingPassword.comparePassword(userStore.password, userInput.password);
    if (!comparePassword) {
      throw new ApiError('Unauthorized', httpStatus.UNAUTHORIZED, 'Email o contraseña incorrectos', true);
    }

    let token;

    if (userStore.role !== 'ROLE_ADMIN') {
      token = generateToken({ id: userStore.id, idBranchOffice: userStore.branch_office.id });
    } else {
      token = generateToken({ id: userStore.id });
    }

    return { token };
  }

  /**
   * It saves the token to the database
   * @param {string} idToken - The idToken that was returned from the signin method.
   */
  public async signout(idToken: string) {
    await this.blackListRepo.saveToken(idToken);
  }

  public async getUser(userID: string, getData?: string) {
    if (!userID) throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID del token.', true);

    const userStore = await this.userService.findUserById(userID, getData);

    if (!userStore)
      throw new ApiError(
        'Not Found User',
        httpStatus.NOT_FOUND,
        'No se ha encontrado el usuario con el ID especificado.',
        true
      );

    const userToClient = deleteFields(userStore, ['password']);

    return { user: userToClient };
  }
}
