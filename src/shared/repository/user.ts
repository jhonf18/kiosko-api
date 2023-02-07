import { ApiError } from '../../config/errors/ApiError';
import { httpStatus } from '../../config/errors/httpStatusCodes';
import { UserDocument, UserModel } from '../schemas/user';
import { IUpdateUser } from './../../modules/backOffice/interfaces/userManagment';
import { BranchOfficeModel } from './../../modules/backOffice/schemas/branchOffice';
import { ICreateUser } from './../interfaces/ICreateUser';

// Add field with minus sign to not send to client
const excludeFields = '-password';

export class UserRepository {
  constructor(private userStore: typeof UserModel, private branchOfficeStore: typeof BranchOfficeModel) {}

  public async saveUser(userInput: ICreateUser) {
    let user = new this.userStore(userInput);

    console.log(user);

    // Find branch office
    const branchOfficeStore = await this.branchOfficeStore.findOneAndUpdate(
      { id: userInput.branchOffice },
      {
        $push: { employees: user._id }
      }
    );
    if (!branchOfficeStore) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El id de la sucursal es incorrecto', true);
    }

    user.branch_office = branchOfficeStore._id;
    try {
      let userDB = await user.save();
      return userDB;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear el usuario',
        true,
        error.message
      );
    }
  }

  public async getUser(
    field: { nameField: string; valueField: any },
    get?: string,
    getFullData?: boolean
  ): Promise<UserDocument | null> {
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
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al buscar el usuario',
        true,
        error.message
      );
    }
  }

  public async getUsers(field: { nameField: string; valueField: any }, get?: string, getFullData?: boolean) {
    const getData = get == null ? null : get;
    const filter: any = {};
    filter[`${field.nameField}`] = field.valueField;
    try {
      let doc;
      if (getFullData) {
        doc = await this.userStore.find(filter, getData, {});
      } else {
        doc = await this.userStore.find(filter, getData, {}).select(excludeFields);
      }
      return doc;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al buscar los usuarios',
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
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al buscar los usuarios por nicknames',
        true,
        error.message
      );
    }
  }

  public async findUsersFromArrayIdsToIdkey(array: Array<string>) {
    let _ids = [];

    for await (const userID of array) {
      let user = await this.getUser({ nameField: 'id', valueField: userID }, '_id');
      if (!user) {
        throw new ApiError(
          'Bad Request',
          httpStatus.BAD_REQUEST,
          'No se ha encontrado el id del usuario al buscar.',
          true,
          'No se ha encontrado el _id del usuario al buscar, path:/userService/findUsersFromArrayIdsToIdkey'
        );
      }
      _ids.push(user?._id);
    }

    return _ids;
  }

  public async updateUser(id: string, userUpdate: IUpdateUser) {
    const userObj = JSON.parse(JSON.stringify(userUpdate));

    // Find branch office
    const branchOfficeStore = await this.branchOfficeStore.findOne({ id: userUpdate.branchOffice }, '_id');
    if (!branchOfficeStore) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El id de la sucursal es incorrecto', true);
    }

    userObj.branch_office = branchOfficeStore._id;

    try {
      return await this.userStore.findOneAndUpdate({ id }, userObj, { new: true }).select('-_id -__v');
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar el usuario',
        true,
        error.message
      );
    }
  }

  /**
   *
   * @param conditions {Object} This is the filter to search for documents and then delete them
   * @returns Returns a promise of type number, if the number = 0 then no docs matched the filter
   */
  public async delete(conditions: Object): Promise<number> {
    try {
      const result = await this.userStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar el usuario',
        true,
        error.message
      );
    }
  }
}
