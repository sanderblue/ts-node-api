import * as fs from 'fs';
import * as http from 'http';
import * as moment from 'moment';

import { DailySnowDepthObservation } from '../entity/DailySnowDepthObservation';
import { DataAggregator } from '../services/DataAggregator';
import { DataTransformer } from '../services/DataTransformer';
import { HourlySnowDepthObservation } from '../entity/HourlySnowDepthObservation';

export class Worker {

  private options: any = {};

  private dataTransformer: DataTransformer;

  private dataAggregator: DataAggregator;

  constructor(options: any = {}) {
    this.options = {
      startDate: options.startDate ? options.startDate : new Date(),
      endDate: options.endDate ? options.endDate : new Date(),
    };

    this.dataTransformer = new DataTransformer();
    this.dataAggregator = new DataAggregator();
  }

  public execute() {
    console.log('Doing work...');
    this.doWork().then((file) => {
      console.log('Done working. Download snow depth observations complete.', file);

      // this.dataTransformer.convertCsvFileToJson(file.path)
      //   .then(this.aggregateData);
    });
  }

  public async doWork() {
    const startDate = new Date(this.options.startDate);
    const endDate = new Date(this.options.endDate);
    const url = this.getSnowDepthUrl(startDate, endDate);

    const download = await this.downloadToFile(url, `/www/ts-node-api/tmp/test.csv`);

    // console.log('Download:', download);

    const jsonData = await this.dataTransformer.convertCsvFileToJson(download.path);
    const result = this.dataTransformer.normalizeJson(jsonData);

    console.log('CSV to JSON result:', result);

    return result;
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
}
