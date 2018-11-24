import * as fs from 'fs';
import * as http from 'http';
import * as moment from 'moment';
import { _ } from 'lodash';

import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import { DailySnowDepthObservation } from '../../entity/DailySnowDepthObservation';
import { DataAggregator } from '../../services/DataAggregator';
import { DatabaseConnection } from '../../config/connection';
import { DataTransformer } from '../../services/DataTransformer';
import { DataUploader } from '../../services/DataUploader';
import { HourlySnowDepthObservation } from '../../entity/HourlySnowDepthObservation';
import { logger } from '../../logger/logger';

export class Worker {
  private options: any = {};

  private dataTransformer: DataTransformer;

  private dataAggregator: DataAggregator;

  private dataUploader: DataUploader;

  private databaseConnection: MongoConnectionOptions;

  private hourlySnowDepthCollection: string = 'hourly_snow_depth_observations';

  private dailySnowDepthCollection: string = 'daily_snow_depth_observations';

  private logger = logger;

  private mongoUrl: string;

  constructor(options: any = {}) {
    this.options = {
      startDate: options.startDate ? options.startDate : new Date(),
      endDate: options.endDate ? options.endDate : new Date(),
    };

    this.databaseConnection = DatabaseConnection;
    this.dataTransformer = new DataTransformer();
    this.dataAggregator = new DataAggregator();

    this.mongoUrl = this.buildConnectionUrl();

    this.dataUploader = new DataUploader(this.mongoUrl);
  }

  private buildConnectionUrl(authDb: string = 'admin'): string {
    const username = this.databaseConnection.username;
    const password = this.databaseConnection.password;
    const db = this.databaseConnection.database;
    const connString = `${username}:${password}@sanderblue.com:27017,sanderblue.com:27017`;
    const authSource = `?authSource=${authDb}`;
    const connectionUrl = `mongodb://${connString}/${db}${authSource}`;

    return connectionUrl;
  }

  public async doWork(): Promise<any> {
    const startDate = new Date(this.options.startDate);
    const endDate = new Date(this.options.endDate);
    const url = this.getSnowDepthUrl(startDate, endDate);
    const dir = process.cwd();
    const download = await this.downloadToFile(url, `${dir}/tmp/test.csv`);
    const hourlyData = await this.dataTransformer.convertCsvFileToJson(
      download.path,
    );
    const dailyData = this.dataAggregator.aggregateDailySnowDepthData(
      hourlyData,
    );

    // console.log('DAILY DATA:', dailyData);

    const promises: Promise<any>[] = [];

    // for (let i = 0; i < dailyData.length; i++) {
    //   promises.push(
    //     this.uploadOne(this.dailySnowDepthCollection, dailyData[i]),
    //   );
    // }

    try {
      const result = await this.uploadData(
        'daily_snow_depth_observations',
        dailyData,
      );

      this.logger.info(`ALL DONE!`);
      this.logger.info(`Result:`, result);

      return result;
    } catch (err) {
      this.logger.error(`ERROR: ${err.message}`);
    }

    // return await Promise.all(promises)
    //   .then((result: any[]) => {
    //     this.logger.info(`ALL DONE!`);
    //     this.logger.info(`Result:`, result);
    //   })
    //   .catch((err: Error) => {
    //     this.logger.error(`ERROR: ${err.message}`);
    //   });
  }

  private uploadOne(collection, data) {
    // const connectionUrl = this.getMongoUrl();

    const connectionUrl = this.mongoUrl;

    return this.dataUploader
      .findAndModifyDocument(connectionUrl, collection, data, true)
      .then((results) => {
        this.logger.info(
          `Successfully added data for date ${data.date} at location ${
            data.location
          } to database.`,
        );
      })
      .catch((err: Error) => {
        this.logger.error(`ERROR: ${err.message}`);
      });
  }

  private async uploadData(collection: string, data: any[]): Promise<any> {
    return await this.dataUploader
      .uploadMultiple(this.mongoUrl, [
        {
          collection: collection,
          data: data,
        },
      ])
      .then((results) => {})
      .catch((err: Error) => {
        this.logger.error(`ERROR: ${err.message}`);
      });
  }

  public cleanUpData() {
    const url = `http://localhost:4040/snow-depth/daily`;

    http.get(url, (res: http.IncomingMessage) => {
      let rawData = '';

      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          // console.log(parsedData);

          const data = this.getDataForDateRange(
            '2017-02-19',
            '2017-02-21',
            parsedData,
          );

          const mtHoodMeadowsData = _.filter(data, (obj: any) => {
            return obj.location === 'MtHoodMeadowsBase';
          });

          console.log('mtHoodMeadowsData:', mtHoodMeadowsData);

          const snowDepthValues = _.map(mtHoodMeadowsData, (obj: any) => {
            return obj.averageSnowDepthForDate;
          });

          console.log('DATA:', snowDepthValues);
        } catch (e) {
          console.error(e.message);
        }
      });
    });
  }

  public async convertedJsonDataFromFile(file) {
    const data = await this.dataTransformer.convertCsvFileToJson(file.path);

    return data;
  }

  public downloadToFile(url: string, dest: string = './'): Promise<any> {
    var file = fs.createWriteStream(dest);

    return new Promise((resolve: any, reject: any) => {
      http
        .get(url, (res: http.IncomingMessage) => {
          res.pipe(file);

          file.on('finish', () => {
            file.close();

            resolve(file);
          });
        })
        .on('error', (err: Error) => {
          this.logger.error(`ERROR: ${err.message}`);

          // Delete the file async
          fs.unlink(dest, () => {
            this.logger.info('Error occurred. Deleted and unlinking file.');

            reject(err);
          });
        });
    });
  }

  private getDataForDateRange(startDate, endDate, data) {
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    return _.filter(data, (item, i) => {
      return item.timestamp >= startTimestamp && item.timestamp <= endTimestamp;
    });
  }

  private getSnowDepthUrl(startDate: Date, endDate: Date): string {
    const startDateFormatted = moment(startDate).format('YYYY-MM-DD');
    const endDateFormatted = moment(endDate).format('YYYY-MM-DD');

    return `http://www.nwac.us/data-portal/csv/location/mt-hood/sensortype/snow_depth/start-date/${startDateFormatted}/end-date/${endDateFormatted}/`;
  }
}
