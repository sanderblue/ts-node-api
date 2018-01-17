import * as fs from 'fs';
import * as http from 'http';
import * as moment from 'moment';

import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import { DailySnowDepthObservation } from '../../entity/DailySnowDepthObservation';
import { DataAggregator } from '../../services/DataAggregator';
import { DatabaseConnection } from '../../config/connection';
import { DataTransformer } from '../../services/DataTransformer';
import { DataUploader } from '../../services/DataUploader';
import { HourlySnowDepthObservation } from '../../entity/HourlySnowDepthObservation';

export class Worker {

  private options: any = {};

  private dataTransformer: DataTransformer;

  private dataAggregator: DataAggregator;

  private dataUploader: DataUploader;

  private databaseConnection: MongoConnectionOptions;

  private hourlySnowDepthCollection: string = 'hourly_snow_depth_observations';

  private dailySnowDepthCollection: string = 'daily_snow_depth_observations';

  constructor(options: any = {}) {
    this.options = {
      startDate: options.startDate ? options.startDate : new Date(),
      endDate: options.endDate ? options.endDate : new Date(),
    };

    this.dataTransformer = new DataTransformer();
    this.dataAggregator = new DataAggregator();
    this.dataUploader = new DataUploader();
    this.databaseConnection = DatabaseConnection;
  }

  public async doWork(): Promise<any> {
    const startDate = new Date(this.options.startDate);
    const endDate = new Date(this.options.endDate);
    const url = this.getSnowDepthUrl(startDate, endDate);
    const dir = process.cwd();
    const download = await this.downloadToFile(url, `${dir}/tmp/test.csv`);
    const hourlyData = await this.dataTransformer.convertCsvFileToJson(download.path);
    const dailyData = this.dataAggregator.aggregateDailySnowDepthData(hourlyData);

    let promises = [];

    for (let i = 0; i < dailyData.length; i++) {
      promises.push(this.uploadOne(
        this.dailySnowDepthCollection,
        dailyData[i]
      ));
    }

    return Promise.all(promises)
      .then(() => {
        console.log(`ALL DONE!`);
        console.log('\n\n');
      })
      .catch((err) => {
        console.log('ERROR OCCURRED!');
      });
  }

  public async convertedJsonDataFromFile(file) {
    const data = await this.dataTransformer.convertCsvFileToJson(file.path);

    return data;
  }

  public downloadToFile(url: string, dest: string = './'): Promise<any> {
    var file = fs.createWriteStream(dest);

    return new Promise((resolve: any, reject: any) => {
      http.get(url, (res: http.IncomingMessage) => {
        res.pipe(file);

        file.on('finish', () => {
          file.close();

          resolve(file);
        });
      }).on('error', (err: Error) => {
        console.error('ERROR:', err.message);

        // Delete the file async
        fs.unlink(dest, () => {
          console.log('Error occurred. Deleted and unlinking file.');

          reject(err);
        });
      });
    });
  }

  private getSnowDepthUrl(startDate: Date, endDate: Date): string {
    const startDateFormatted = moment(startDate).format('YYYY-MM-DD');
    const endDateFormatted = moment(endDate).format('YYYY-MM-DD');;

    return `http://www.nwac.us/data-portal/csv/location/mt-hood/sensortype/snow_depth/start-date/${startDateFormatted}/end-date/${endDateFormatted}/`;
  }

  private uploadOne(collection, data) {
    const connectionUrl = this.getMongoUrl();

    return this.dataUploader.findAndModifyDocument(
      connectionUrl,
      collection,
      data,
      true
    ).then((results) => {
      console.log('Results:', results);

      console.log(`Successfully added data for date ${data.date} at location ${data.location} to database.`);
    }).catch((err: Error) => {
      throw err;
    });
  }

  private uploadData(collection, data) {
    const connectionUrl = this.getMongoUrl();

    this.dataUploader.uploadMultiple(connectionUrl, [
      {
        collection: collection,
        data: data
      }
    ]).then((results) => {
      console.log('Successfully add data to database.');
    }).catch((err: Error) => {
      throw err;
    });
  }

  private getMongoUrl() {
    const username = this.databaseConnection.username;
    const password = this.databaseConnection.password;
    const db = this.databaseConnection.database;

    return `mongodb://${username}:${password}@sanderblue.com:27017,sanderblue.com:27017/${db}`;
  }
}
