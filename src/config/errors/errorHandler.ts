import { logger } from '../logger/logger';
import { ApiError } from './ApiError';
import { BaseError } from './baseError';

export const isOperationalError = (error: Error | ApiError) => {
  if (error instanceof BaseError) {
    return error.isOperational;
  }

  return false;
};

export const logError = (error: Error | ApiError | any) => {
  logger.error(error);
};

process.on('uncaughtException', (error: Error | ApiError) => {
  logError(error);
});

process.on('unhandledRejection', (error: Error | ApiError) => {
  if (!isOperationalError(error)) {
    process.exit(1);
  }
});
