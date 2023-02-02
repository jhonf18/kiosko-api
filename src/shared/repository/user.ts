import { ApiError } from '../../config/errors/ApiError';
import { httpStatus } from '../../config/errors/httpStatusCodes';
import { UserModel } from '../schemas/user';
import { ICreateUser } from './../interfaces/ICreateUser';

// add field with minus sign to not send to client
const excludeFields = '-password';

export class UserRepository {
  userStore = UserModel;
  constructor() {}

  public async saveUser(userInput: ICreateUser) {
    const user = new this.userStore(userInput);

    try {
      let userDB = await user.save();
      return userDB;
    } catch (error: any) {
      throw new ApiError(
        'Error to create user',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear el usuario',
        true,
        error.message
      );
    }
  }

  public async getUser(field: { nameField: string; valueField: any }, get?: string, getFullData?: boolean) {
    const getData = get == null ? null : get;
    const filter: any = {};
    filter[`${field.nameField}`] = field.valueField;
    try {
      let doc;
      if (getFullData) {
        doc = await this.userStore.findOne(filter, getData, {});
      } else {
        doc = await this.userStore.findOne(filter, getData, {}).select(excludeFields);
      }
      return doc;
    } catch (error: any) {
      throw new ApiError(
        'Error to find user',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al buscar el usuario',
        true,
        error.message
      );
    }
  }

  public async findUsersByNicknameWithRegex(regex: string) {
    try {
      let nicknames: Array<string> = [];
      const docs = await this.userStore
        .find({ nickname: { $regex: regex, $options: 'is' } }, 'nickname', {})
        .select(excludeFields);

      if (!docs || docs.length === 0) {
        return nicknames;
      } else {
        Array.from(docs).forEach(doc => {
          nicknames.push(doc.nickname);
        });
        return nicknames;
      }
    } catch (error: any) {
      throw new ApiError(
        'Error to find user by regex',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al buscar los usuarios por nicknames',
        true,
        error.message
      );
    }
  }
}
