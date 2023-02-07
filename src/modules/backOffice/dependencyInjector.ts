import * as awilix from 'awilix';
import { container } from '../../shared';
import { BranchOfficeRepository } from './repository/branchOffice';
import { BranchOfficeService } from './services/BranchOffice';
import { UserServiceManagment } from './services/UserManagment';

container.register({
  branchOfficeService: awilix.asClass(BranchOfficeService),
  branchOfficeRepo: awilix.asClass(BranchOfficeRepository),
  userServiceManagment: awilix.asClass(UserServiceManagment)
});

export const branchOfficeService: BranchOfficeService = container.resolve('branchOfficeService');
export const userServiceManagment: UserServiceManagment = container.resolve('userServiceManagment');
