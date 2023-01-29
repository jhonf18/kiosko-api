import { BaseError } from './baseError';

export class ApiError extends BaseError {
  /**
   *
   * @param name - Name of the error. You can pass a custom error by typing CUSTOM in this field.
   * @param status - Status http.
   * @param description - Description of error. If your error is custom write to name here.
   * @param isOperational - If the error is operational.
   * @param cause - Cause of the error. Fill in this field if yoy want to save the error or if your error is custom write into an array.
   */
  constructor(name: string, status: number, description: string, isOperational: boolean, cause?: string | Array<any>) {
    super(name, status, description, isOperational, cause);
  }
}
