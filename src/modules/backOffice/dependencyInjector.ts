import * as awilix from 'awilix';
import { container } from '../../shared';
import { BranchOfficeRepository } from './repository/branchOffice';
import { BranchOfficeService } from './services/BranchOffice';

container.register({
  branchOfficeService: awilix.asClass(BranchOfficeService),
  branchOfficeRepo: awilix.asClass(BranchOfficeRepository)
});

export const branchOfficeService: BranchOfficeService = container.resolve('branchOfficeService');
