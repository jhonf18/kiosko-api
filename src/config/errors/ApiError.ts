import { BaseError } from './baseError';

export class ApiError extends BaseError {
  constructor(name: string, status: number, description: string, isOperational: boolean) {
    super(name, status, description, isOperational);
  }
}
