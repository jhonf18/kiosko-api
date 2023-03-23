import { v4 as uuidv4 } from 'uuid';
import { deleteFields } from '../../utils/deleteFields';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { UserRepository } from './../../../shared/repository/user';
import { isNotEmpty } from './../../utils/validations';
import { createBranchOfficeInput, updateBranchOfficeInput } from './../dto/branchOffice';
import { BranchOfficeRepository } from './../repository/branchOffice';

export class BranchOfficeService {
  constructor(private branchOfficeRepo: BranchOfficeRepository, private readonly userRepo: UserRepository) {}

  public async createBranchOffice(branchOfficeInput: createBranchOfficeInput) {
    // validate fields
    const fields: Array<string> = ['name', 'address'];

    const validatorSignup = isNotEmpty(branchOfficeInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const branchOfficeRecord = await this.branchOfficeRepo.save({
      id: uuidv4(),
      name: branchOfficeInput.name,
      address: branchOfficeInput.address,
      employees: branchOfficeInput.employees
    });

    if (branchOfficeInput.employees && branchOfficeInput.employees.length > 0) {
      await this.userRepo.updateManyUsersForIds(branchOfficeInput.employees, { branch_office: branchOfficeRecord._id });
    }

    return { branch_office: deleteFields(branchOfficeRecord) };
  }

  public async getBranchOffices(getData?: string) {
    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.branchOfficeRepo.find(getData);
    } else {
      return await this.branchOfficeRepo.find();
    }
  }

  public async getBranchOffice(id: string, getData?: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    if (getData) {
      const dataArray = getData.split(',');
      getData = dataArray.join(' ');
      return await this.branchOfficeRepo.findOne({ id }, getData);
    } else {
      return await this.branchOfficeRepo.findOne({ id });
    }
  }

  public async updateBranchOffice(id: string, branchOfficeInput: updateBranchOfficeInput, addEmployee?: boolean) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id }, 'id');
    if (!branchOfficeStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal a editar', true);
    }

    const branchOfficeRecord = await this.branchOfficeRepo.update(
      { id: branchOfficeStore.id },
      branchOfficeInput,
      addEmployee
    );

    return { branch_office: deleteFields(branchOfficeRecord as any) };
  }

  public async deleteBranchOffice(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }
    const branchDelete = await this.branchOfficeRepo.delete({ id: id });
    if (!branchDelete || branchDelete === 0) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontro sucursal para eliminar', true);
    }

    return true;
  }

  public removeAUserFromBranchOffice = async (_idBranch: Object, typeUser: any, _id: any) => {
    let toUpdate: { $pull: { [key: string]: any } } = { $pull: {} };
    toUpdate.$pull[typeUser] = _id;

    return await this.branchOfficeRepo.deleteUserFromArray(_idBranch, toUpdate);
  };
}
