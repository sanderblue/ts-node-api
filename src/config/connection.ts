import { DailySnowDepthObservation } from '../entity/DailySnowDepthObservation';
import { HourlySnowDepthObservation } from '../entity/HourlySnowDepthObservation';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';

console.log('process.env.DB_HOST', process.env.DB_HOST);

const userPassword = `${process.env.DB_USER}:${process.env.DB_PASSWORD}`;
const connString = `${userPassword}@${process.env.DB_HOST}:27017,${
  process.env.DB_HOST
}:27017`;
const authSource = `?authSource=admin`;
const connectionUrl = `mongodb://${connString}/${
  process.env.DB_NAME
}${authSource}`;

// console.log('CONNECTION URL:', connectionUrl);

export const DatabaseConnection: MongoConnectionOptions = {
  // url: connectionUrl,
  type: 'mongodb',
  host: process.env.DB_HOST,
  port: 27017,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  authSource: 'admin',
  entities: [DailySnowDepthObservation, HourlySnowDepthObservation],
  synchronize: true,
  logging: false,
  connectTimeoutMS: 60000,
};
