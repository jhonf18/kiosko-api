import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { UserRepository } from './../../../shared/repository/user';
import { UserModel } from './../../../shared/schemas/user';
import { getElementsDifferentsOfTwoArrays } from './../../../utilities/index';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { IBranchOffice, IUpdateBranchOffice } from './../interfaces/branchOffice';
import { BranchOfficeModel } from './../schemas/branchOffice';

export class BranchOfficeRepository {
  constructor(private userRepo: UserRepository, private branchOfficeStore: typeof BranchOfficeModel) {}

  private getKeysId(array: Array<any>): Array<any> {
    let arr: Array<any> = [];
    array.forEach(el => {
      arr.push(el._id);
    });

    return arr;
  }

  private async preparateDataForDB(
    branchOffice: IBranchOffice | { employees?: Array<string> },
    branchOfficeStore?: any
  ): Promise<IBranchOffice | any> {
    let employees = [];

    try {
      if (branchOffice.employees && branchOffice.employees.length !== 0) {
        employees = await this.userRepo.findUsersFromArrayIdsToIdkey(branchOffice!.employees);
      }

      if (branchOfficeStore) {
        branchOffice = branchOfficeStore;
        if (branchOffice.employees) {
          const ids = this.getKeysId(branchOffice.employees);

          branchOffice.employees = branchOffice.employees.concat(getElementsDifferentsOfTwoArrays(employees, ids));
        }
      } else {
        branchOffice.employees = employees;
      }

      return branchOffice;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw new ApiError(error.name, error.statusCode, error.description, true, error.cause);
      } else {
        throw new ApiError(
          'Internal Error',
          httpStatus.INTERNAL_SERVER_ERROR,
          'Ha ocurrido un error inesperado al crear la sucursal',
          true,
          error.message
        );
      }
    }
  }

  public async save(branchOffice: Object) {
    const branchOfficeOK = await this.preparateDataForDB(branchOffice);
    const branchOfficeStore = new this.branchOfficeStore(branchOfficeOK);

    try {
      const branchOfficeRecord = await branchOfficeStore.save();
      return branchOfficeRecord;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al crear la sucursal',
        true,
        error.message
      );
    }
  }

  public async find(getData?: string, populate?: Array<{ name: string; populate?: Array<string> }>) {
    const dataForNotSendDefault = '-_id';
    const dataForNotSendIfNotPopulated = `${dataForNotSendDefault} -password -__v`;

    if (getData) {
      const parametrizationSearchParams = parameterizeSearchWithParams(getData, 'password _id __v');
      getData = parametrizationSearchParams.select;
    } else {
      getData = '';
    }

    getData = `${getData} ${dataForNotSendDefault}`;

    if (!populate) {
      const getDataArray = getData.split(' ');
      populate = [];
      for (let i = 0; i < getDataArray.length; i++) {
        if (getDataArray[i].trim() === 'employees') {
          populate.push({ name: getDataArray[i] });
        }
      }
    }

    let populateData: any = [];
    populate?.forEach(el => {
      if (el.name === 'employees') {
        populateData.push({
          path: el.name,
          model: UserModel,
          select: el.populate ? `${el.populate.join(' ')} ${dataForNotSendDefault}` : dataForNotSendIfNotPopulated
        });
      }
    });

    try {
      const branchOfficesStore = await this.branchOfficeStore.find({}, getData).populate(populateData);
      return branchOfficesStore;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener las sucursales',
        true,
        error.message
      );
    }
  }

  public async findOne(
    conditions: Object,
    getData?: string,
    populate?: Array<{ name: string; populate?: Array<string> }>
  ) {
    const dataForNotSendDefault = '';
    const dataForNotSendIfNotPopulated = `${dataForNotSendDefault} -password -__v`;

    if (getData) {
      const parametrizationSearchParams = parameterizeSearchWithParams(getData, 'password -_id __v');
      getData = parametrizationSearchParams.select;
    } else {
      getData = '';
    }

    getData = `${getData} ${dataForNotSendDefault}`;

    if (!populate) {
      const getDataArray = getData.split(' ');
      populate = [];
      for (let i = 0; i < getDataArray.length; i++) {
        if (getDataArray[i].trim() === 'employees') {
          populate.push({ name: getDataArray[i] });
        }
      }
    }

    let populateData: any = [];
    populate?.forEach(el => {
      if (el.name === 'employees') {
        populateData.push({
          path: el.name,
          model: UserModel,
          select: el.populate ? `${el.populate.join(' ')} ${dataForNotSendDefault}` : dataForNotSendIfNotPopulated
        });
      }
    });

    try {
      const branchOfficesStore = await this.branchOfficeStore.findOne(conditions, getData).populate(populateData);

      return branchOfficesStore;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener la sucursale',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, branchOffice: IUpdateBranchOffice, addEmployee?: boolean) {
    let branchOfficeStore: any;
    if (addEmployee) {
      branchOfficeStore = await this.findOne(conditions, 'employees');
    } else {
      branchOfficeStore = null;
    }

    const branchOfficeOK = await this.preparateDataForDB(branchOffice, branchOfficeStore);
    try {
      const updateBranchOfficeStore = await this.branchOfficeStore.findOneAndUpdate(conditions, branchOfficeOK, {
        new: true
      });
      return updateBranchOfficeStore;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al actualizar las sucursales',
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
      const result = await this.branchOfficeStore.deleteOne(conditions);

      return result.deletedCount;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar la sucursal',
        true,
        error.message
      );
    }
  }

  public async deleteUserFromArray(_id: any, update: Object) {
    try {
      console.log(update);
      const updateBranchOfficeStore = await this.branchOfficeStore.findByIdAndUpdate(_id, update, {
        new: true
      });
      return updateBranchOfficeStore;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al eliminar el usuario de la sucursal',
        true,
        error.message
      );
    }
  }
}
