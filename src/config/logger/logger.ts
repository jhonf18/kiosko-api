import winston from 'winston';

export const logger: winston.Logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File({ filename: 'logs/.log', level: 'error' }),
    new winston.transports.Console()
  ],
  exitOnError: false
});
