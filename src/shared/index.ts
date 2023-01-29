import * as awilix from 'awilix';
import { UserRepository } from './dao/user';
import { UserService } from './services/user';

export const container = awilix.createContainer({ injectionMode: awilix.InjectionMode.CLASSIC });

container.register({
  userService: awilix.asClass(UserService),
  userRepository: awilix.asClass(UserRepository)
});

export const DUserService = container.resolve('userService');
