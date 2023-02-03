import * as awilix from 'awilix';
import { UserRepository } from './repository/user';
import { UserModel } from './schemas/user';
import { UserService } from './services/user';

export const container = awilix.createContainer({ injectionMode: awilix.InjectionMode.CLASSIC });

container.register({
  // Services
  userService: awilix.asClass(UserService),

  // Repositories
  userRepo: awilix.asClass(UserRepository),

  // Stores
  userStore: awilix.asValue(UserModel)
});

export const DUserService = container.resolve('userService');
