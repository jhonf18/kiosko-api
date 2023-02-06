import * as awilix from 'awilix';
import { BranchOfficeModel } from './../modules/backOffice/schemas/branchOffice';
import { UserRepository } from './repository/user';
import { UserModel } from './schemas/user';
import { UserService } from './services/user';

export const container = awilix.createContainer({ injectionMode: awilix.InjectionMode.CLASSIC });

container.register({
  // Services
  userService: awilix.asClass(UserService),

  // Repositories
  userRepo: awilix.asClass(UserRepository),

  branchOfficeStore: awilix.asValue(BranchOfficeModel),
  // Stores
  userStore: awilix.asValue(UserModel)
});

export const DUserService = container.resolve('userService');
