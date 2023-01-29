import { ApiError } from '../../config/errors/ApiError';
import { httpStatus } from '../../config/errors/httpStatusCodes';
import { UserModel } from '../schemas/user';
import { ICreateUser } from './../interfaces/ICreateUser';

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

  public async getUser(field: { nameField: string; valueField: any }, get?: string) {
    const getData = get == null ? null : get;
    const filter: any = {};
    filter[`${field.nameField}`] = field.valueField;
    try {
      const doc = await this.userStore.findOne(filter, getData, {});
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
}
