import { v4 as uuidv4 } from 'uuid';
import { deleteFields } from '../../utils/deleteFields';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { isNotEmpty } from './../../utils/validations';
import { createBranchOfficeInput, updateBranchOfficeInput } from './../dto/branchOffice';
import { BranchOfficeRepository } from './../repository/branchOffice';

export class BranchOfficeService {
  constructor(private branchOfficeRepo: BranchOfficeRepository) {}

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
      employees: branchOfficeInput.employees,
      leaders: branchOfficeInput.leaders
    });

    return { branch_office: deleteFields(branchOfficeRecord, ['employees', 'leaders']) };
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

  public async updateBranchOffice(id: string, branchOfficeInput: updateBranchOfficeInput) {
    // TODO: Editar sucursal según el id
    // Debe retornar la sucursal actualizada
    // validate fields
    const fields: Array<string> = ['name', 'address'];

    const validatorSignup = isNotEmpty(branchOfficeInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    const branchOfficeStore = await this.branchOfficeRepo.findOne({ id }, 'id');
    if (!branchOfficeStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado la sucursal a editar', true);
    }

    const branchOfficeRecord = await this.branchOfficeRepo.update(
      { id: branchOfficeStore.id },
      {
        name: branchOfficeInput.name,
        address: branchOfficeInput.address,
        employees: branchOfficeInput.employees,
        leaders: branchOfficeInput.leaders
      }
    );

    return { branch_office: branchOfficeRecord };
  }

  public async deleteBranchOffice(id: string) {
    // TODO: Editar perfil del usuario
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }
    const branchDelete = await this.branchOfficeRepo.delete({ id: id });
    console.log(branchDelete);
    if (!branchDelete || branchDelete === 0) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontro sucursal para eliminar', true);
    }

    return true;
  }
}
