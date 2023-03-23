import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { UserRepository } from './../../../shared/repository/user';
import { UserModel } from './../../../shared/schemas/user';
import { differenceBetweenArrays } from './../../../utilities/index';
import { parameterizeSearchWithParams } from './../../utils/parameterizeSearchWithParams';
import { IBranchOffice, IUpdateBranchOffice } from './../interfaces/branchOffice';
import { BranchOfficeModel } from './../schemas/branchOffice';

export class BranchOfficeRepository {
  constructor(private userRepo: UserRepository, private branchOfficeStore: typeof BranchOfficeModel) {}

  private async preparateDataForDB(
    branchOffice: IBranchOffice | { employees?: string[] },
    branchOfficeStore?: any
  ): Promise<IBranchOffice | any> {
    if (!branchOfficeStore && branchOffice.employees) {
      branchOffice.employees = await this.userRepo.findUsersFromArrayIdsToIdkey(branchOffice!.employees);
      return branchOffice;
    }

    if (branchOfficeStore && branchOfficeStore.employees && branchOffice.employees) {
      try {
        const employesStoreIDS = branchOfficeStore.employees.map((e: any) => e.id);
        const employesStoreIDSKey = branchOfficeStore.employees.map((e: any) => e._id);

        // Comparate Ids of users for update with users in store
        const {
          areEquals,
          differenceElementsFirstArray: userIDSToDeleteBranchOffice,
          differenceElementsSecondArray: userIDSToAddBranchOffice
        } = differenceBetweenArrays(employesStoreIDS, branchOffice.employees);

        if (areEquals) {
          branchOffice.employees = employesStoreIDSKey;
        } else {
          branchOffice.employees = branchOfficeStore.employees.map((e: any) => e._id);

          if (userIDSToDeleteBranchOffice.length > 0) {
            this.userRepo.updateManyUsersForIds(userIDSToDeleteBranchOffice, { branch_office: null });
            const remainingEmployees = branchOfficeStore.employees
              .filter((e: any) => !userIDSToDeleteBranchOffice.includes(e.id))
              .map((e: any) => e._id);
            branchOffice.employees = branchOffice.employees?.filter(d => remainingEmployees.includes(d));
          }

          if (userIDSToAddBranchOffice.length > 0) {
            branchOffice.employees = branchOffice.employees || [];
            branchOffice.employees = branchOffice.employees?.concat(
              await this.userRepo.findUsersFromArrayIdsToIdkey(userIDSToAddBranchOffice)
            );
            await this.userRepo.updateManyUsersForIds(userIDSToAddBranchOffice, {
              branch_office: branchOfficeStore._id
            });
          }

          return branchOffice;
        }
      } catch (error: any) {
        if (error instanceof ApiError) {
          throw new ApiError(error.name, error.statusCode, error.description, true, error.cause);
        } else {
          throw new ApiError(
            'Internal Error',
            httpStatus.INTERNAL_SERVER_ERROR,
            'Ha ocurrido un error inesperado al crear o al actualizar la sucursal.',
            true,
            error.message
          );
        }
      }
    }
    return branchOffice;
  }

  public async save(branchOffice: Object) {
    const branchOfficeOK = await this.preparateDataForDB(branchOffice);
    const branchOfficeStore = new this.branchOfficeStore(branchOfficeOK);

    try {
      const branchOfficeRecord = await branchOfficeStore.save();
      return branchOfficeRecord.populate({
        path: 'employees',
        model: UserModel,
        select: 'id name role nickname -_id'
      });
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

  public async find(getData?: string) {
    let populate = [];

    if (getData) {
      const parametrizationSearchParams = parameterizeSearchWithParams(getData, '_id __v', '-_id');
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
      getData = '';
    }

    try {
      const branchOfficesStore = await this.branchOfficeStore.find({}, getData).populate(populate);
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

  public async findOne(conditions: Object, getData?: string, getKeyID?: boolean) {
    let populate: any[] = [];

    if (getData) {
      const parametrizationSearchParams = !getKeyID
        ? parameterizeSearchWithParams(getData, '_id __v', '-_id')
        : parameterizeSearchWithParams(getData, '_id __v');
      getData = parametrizationSearchParams.select;

      if (parametrizationSearchParams.populateOneLevel.length > 0) {
        for (let populate of parametrizationSearchParams.populateOneLevel) {
          if (populate.path === 'employees') {
            populate.model = UserModel;
          }
          if (!getKeyID) populate.select += '-_id';
        }

        populate = parametrizationSearchParams.populateOneLevel;
      }
    } else {
      getData = '';
    }

    try {
      return await this.branchOfficeStore.findOne(conditions, getData).populate(populate);
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al obtener la sucursal.',
        true,
        error.message
      );
    }
  }

  public async update(conditions: Object, branchOffice: IUpdateBranchOffice, _addEmployee?: boolean) {
    const branchOfficeStore = await this.findOne(conditions, 'employees.id employees._id _id', true);

    const branchOfficeOK = await this.preparateDataForDB(branchOffice, branchOfficeStore);
    try {
      const updateBranchOfficeStore = await this.branchOfficeStore.findOneAndUpdate(conditions, branchOfficeOK, {
        new: true
      });
      return updateBranchOfficeStore?.populate({
        path: 'employees',
        model: UserModel,
        select: 'id name nickname role -_id'
      });
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
