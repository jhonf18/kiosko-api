import winston, { format } from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  level: 'error',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

export const logger: winston.Logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [transport, new winston.transports.Console()],
  format: format.combine(format.timestamp(), format.json()),
  exitOnError: false
});
