export class BaseError extends Error {
  description: string;
  statusCode: number;
  isOperational: boolean;

  constructor(name: string, statusCode: number, description: string, isOperational: boolean) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.description = description;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
    // Object.setPrototypeOf(this, BaseError.prototype);
  }
}
