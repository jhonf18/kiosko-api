import { v4 as uuidv4 } from 'uuid';
import { deleteFields } from '../../utils/deleteFields';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { isNotEmpty } from './../../utils/validations';
import { createBranchOfficeInput } from './../dto/branchOffice';
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

  public async getBranchOffices() {}

  public async editBranchOffice() {}
}
