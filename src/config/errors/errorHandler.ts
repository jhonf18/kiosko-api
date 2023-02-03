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
  if (error instanceof Error || error instanceof ApiError) {
    logger.error(error.message);
  } else {
    logger.error(error);
  }
};

process.on('uncaughtException', (error: Error | ApiError) => {
  console.log(error);
  logError(error);
});

process.on('unhandledRejection', (error: Error | ApiError) => {
  console.log(error);
  if (!isOperationalError(error)) {
    logError(error.message);
    process.exit(1);
  }
});
