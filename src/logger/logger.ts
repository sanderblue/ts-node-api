import { Logger, transports } from 'winston';

export const logger = new Logger({
  transports: [
    new transports.File({ name: 'errorLog', filename: 'logs/error.log', level: 'error' }),
    new transports.File({ name: 'infoLog', filename: 'logs/info.log', level: 'info' }),
  ]
});
