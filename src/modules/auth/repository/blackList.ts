import { BlackListModel } from '../schemas/blackList';
import { ApiError } from './../../../config/errors/ApiError';
import { httpStatus } from './../../../config/errors/httpStatusCodes';

export class BlackListRepository {
  blackListStore = BlackListModel;

  public async saveToken(id: string) {
    const blackList = new this.blackListStore({ id });

    try {
      await blackList.save();
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al cerrar la sesión',
        true,
        error.message
      );
    }
  }

  public async findToken(id: string) {
    try {
      const doc = await this.blackListStore.findOne({ id });

      return doc;
    } catch (error: any) {
      throw new ApiError(
        'Internal Error',
        httpStatus.INTERNAL_SERVER_ERROR,
        'Ha ocurrido un error inesperado al verificar el token',
        true,
        error.message
      );
    }
  }
}
