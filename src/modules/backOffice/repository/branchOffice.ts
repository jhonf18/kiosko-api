import { UserService } from '../../../shared/services/user';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { IBranchOffice } from './../interfaces/branchOffice';
import { BranchOfficeModel } from './../schemas/branchOffice';

export class BranchOfficeRepository {
  constructor(private userService: UserService, private branchOfficeStore: typeof BranchOfficeModel) {}

  public async save(branchOffice: IBranchOffice) {
    const branchOfficeStore = new this.branchOfficeStore({
      id: branchOffice.id,
      name: branchOffice.name,
      address: branchOffice.address
    });

    let employees = [];
    let leaders = [];

    try {
      if (branchOffice.employees && branchOffice.employees.length !== 0) {
        employees = await this.userService.findUsersFromArrayIdsToIdkey(branchOffice!.employees);
      }

      if (branchOfficeStore.employees) {
        branchOfficeStore.employees.push(...employees);
      }

      if (branchOffice.leaders && branchOffice.leaders.length !== 0) {
        leaders = await this.userService.findUsersFromArrayIdsToIdkey(branchOffice!.leaders);
      }

      if (branchOfficeStore.leaders) {
        branchOfficeStore.leaders.push(...leaders);
      }

      const branchOfficeRecord = await branchOfficeStore.save();
      return branchOfficeRecord;
    } catch (error: any) {
      console.log(error);
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
