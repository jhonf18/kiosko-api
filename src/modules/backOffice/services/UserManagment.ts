import { UserRepository } from '../../../shared/repository/user';
import { deleteFields } from '../../utils/deleteFields';
import { IUpdateUser } from '../interfaces/userManagment';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { ROLES } from './../../../shared/config/roles';
import { getKeyByValue } from './../../../utilities/index';
import { HashingPassword } from './../../utils/hashingPassword';
import { ValidatorUser } from './../../utils/validationsUser';
import { BranchOfficeService } from './BranchOffice';

export class UserServiceManagment {
  private hashingPassword = new HashingPassword();

  constructor(
    private userRepo: UserRepository,
    private validatorUser: ValidatorUser,
    private branchOfficeService: BranchOfficeService
  ) {}

  public async updateUser(id: string, userInput: IUpdateUser) {
    // Validate fields
    const fields: Array<string> = ['name', 'role', 'active'];

    const validatorSignup = await this.validatorUser.Signup(userInput, fields);
    if (validatorSignup.error) {
      throw new ApiError('CUSTOM', httpStatus.BAD_REQUEST, 'Error in the inputs', true, validatorSignup.errors);
    }

    const userStore = await this.userRepo.getUser(
      { nameField: 'id', valueField: id },
      'id branch_office password _id role',
      true
    );
    if (!userStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado el usuario', true);
    }
    // Validate that the role sent is among the available ones and that it is different from admin
    const roleFound = getKeyByValue(ROLES, userInput.role);

    if (
      userStore.role !== 'ROLE_ADMIN' &&
      (!roleFound || roleFound === ROLES.ADMIN || userInput.role === ROLES.ADMIN)
    ) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'El rol no es correcto', true);
    }

    if (userInput.branchOffice) {
      // Search back office
      const branchOfficeStore = await this.branchOfficeService.getBranchOffice(
        userInput.branchOffice,
        'id employees employees.id _id'
      );
      if (!branchOfficeStore)
        throw new ApiError(
          'Not Found',
          httpStatus.NOT_FOUND,
          'No se ha encontrado la sucursal asignada al usuario',
          true
        );

      // Remove user from the branch in which he was already
      await this.branchOfficeService.removeAUserFromBranchOffice(userStore.branch_office, 'employees', userStore._id);

      const employeesIDS = branchOfficeStore.employees.map((e: any) => e.id) as string[];

      if (!employeesIDS.includes(userStore.id)) {
        let employeesWithNewUser: string[] = employeesIDS;
        employeesWithNewUser.push(userStore.id as string);

        const updateBranchOfficeResult = await this.branchOfficeService.updateBranchOffice(branchOfficeStore.id, {
          employees: employeesWithNewUser
        });
        if (!updateBranchOfficeResult.branch_office) {
          throw new ApiError(
            'Interal Error',
            httpStatus.INTERNAL_SERVER_ERROR,
            'Ha ocurrido un error al actualizar la sucursal',
            true
          );
        }
      }
    }

    console.log(userInput.password);

    // Hashing password
    if (userInput.password && userInput.password.length > 0) {
      console.log(userInput.password);
      userStore.password = await this.hashingPassword.encryptPassword(userInput.password);
    }

    // Save user in DB
    const userRecord = await this.userRepo.updateUser(id, {
      name: userInput.name,
      password: userStore.password,
      role: userInput.role,
      branchOffice: userInput.branchOffice,
      active: userInput.active
    });

    const userToClient = deleteFields(userRecord!, ['password']);

    return { user: userToClient };
  }

  public async deleteUser(id: string) {
    if (!id) {
      throw new ApiError('Bad Request', httpStatus.BAD_REQUEST, 'No se puede leer el ID', true);
    }

    // Delete user of DB in branch office
    const userStore = await this.userRepo.getUser({ nameField: 'id', valueField: id }, 'id branch_office _id');
    if (!userStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado el usuario', true);
    }

    await this.branchOfficeService.removeAUserFromBranchOffice(userStore.branch_office, 'employees', userStore._id);

    // Delete user of DB
    const userDelete = await this.userRepo.delete({ id: id });
    if (!userDelete || userDelete === 0) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se encontró usuario para eliminar', true);
    }

    return true;
  }

  public async getUsers(filter: Object, getData: string): Promise<any[]> {
    getData = getData || '';
    let dataArray = getData.split(',');
    getData = dataArray.join(' ');

    let users = (await this.userRepo.getUsers(filter, getData)) as any;

    return users;
  }

  public async verifyPassword(id: string, password: string) {
    if (!password || password.length === 0) {
      throw new ApiError('Bad Requesst', httpStatus.BAD_REQUEST, 'Es necesario ingresar la contraseña', true);
    }
    const userStore = await this.userRepo.getUser(
      { nameField: 'id', valueField: id },
      'id branch_office password _id',
      true
    );
    if (!userStore) {
      throw new ApiError('Not Found', httpStatus.NOT_FOUND, 'No se ha encontrado el usuario', true);
    }

    const comparePassword = await this.hashingPassword.comparePassword(userStore.password, password);
    if (!comparePassword) {
      // throw new ApiError('Unauthorized', httpStatus.UNAUTHORIZED, 'Contraseña incorrecta', true);
      return {
        result: { status: 'FAILED', message: 'Contraseña incorrecta' }
      };
    } else {
      return {
        result: { status: 'SUCCESS', message: 'OK' }
      };
    }
  }
}
