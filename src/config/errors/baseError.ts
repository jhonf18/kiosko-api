import { logError } from './errorHandler';

export class BaseError extends Error {
  description: string;
  statusCode: number;
  isOperational: boolean;
  cause?: string | Array<any>;

  constructor(
    name: string,
    statusCode: number,
    description: string,
    isOperational: boolean,
    cause?: string | Array<any>
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.description = description;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.cause = cause;
    Error.captureStackTrace(this);
    if (cause && name !== 'CUSTOM') {
      logError(cause);
    }
    // Object.setPrototypeOf(this, BaseError.prototype);
  }
}
