import { ApiError } from '../../config/errors/ApiError';
import { httpStatus } from '../../config/errors/httpStatusCodes';
import { UserDocument, UserModel } from '../schemas/user';
import { IUpdateUser } from './../../modules/backOffice/interfaces/userManagment';
import { BranchOfficeModel } from './../../modules/backOffice/schemas/branchOffice';
import { parameterizeSearchWithParams } from './../../modules/utils/parameterizeSearchWithParams';
import { ICreateUser } from './../interfaces/ICreateUser';

// Add field with minus sign to not send to client
const excludeFields = '-password';

export class UserRepository {
  constructor(private userStore: typeof UserModel, private branchOfficeStore: typeof BranchOfficeModel) {}

  public async saveUser(userInput: ICreateUser) {
    let user = new this.userStore(userInput);

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
      return userDB.populate({
        path: 'branch_office',
        select: 'id name -_id',
        model: BranchOfficeModel
      });
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
    getData?: string,
    getFullData?: boolean
  ): Promise<UserDocument | null> {
    const filter: any = {};
    filter[`${field.nameField}`] = field.valueField;

    let populate = [];

    if (getData) {
      const parametrizationSearchParams = !getFullData
        ? parameterizeSearchWithParams(getData, 'password _id __v', '-_id')
        : parameterizeSearchWithParams(getData, '_id __v');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'branch_office') {
            populate.model = BranchOfficeModel;
          }
          populate.select += ' -_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '';
    }

    try {
      return await this.userStore.findOne(filter, getData).populate(populate);
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

  public async getUsers(filter: Object, getData?: string, getFullData?: boolean) {
    let populate = [];

    if (!getFullData && getData) {
      const parametrizationSearchParams = parameterizeSearchWithParams(getData, 'password _id __v', '-_id');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'employees') {
            populate.model = UserModel;
          }
          populate.select += '-_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '-_id -__v';
    }

    try {
      if (getFullData) return await this.userStore.find(filter);
      else return await this.userStore.find(filter, getData).populate(populate);
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
      let user = await this.getUser({ nameField: 'id', valueField: userID }, '_id', true);

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
      return await this.userStore.findOneAndUpdate({ id }, userObj, { new: true }).select('-_id -__v').populate({
        path: 'branch_office',
        model: BranchOfficeModel,
        select: 'id name address -_id'
      });
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

  public async updateManyUsersForIds(ids: string[], update: object) {
    const conditionsOK = {
      $or: ids.map(id => ({ id: id }))
    };

    try {
      return await this.userStore.updateMany(conditionsOK, update);
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
