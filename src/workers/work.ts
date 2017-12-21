import * as fs from 'fs';
import * as http from 'http';
import * as moment from 'moment';

import DataTransformer from '../services/data-transformer';

export class Worker {

  private dataTransformer: DataTransformer;

  constructor() {
    this.dataTransformer = new DataTransformer();
  }

  public execute() {
    console.log('Doing work...');
    this.doWork().then((file) => {
      console.log('Done working. Download snow depth observations complete.', file);

      // this.dataTransformer.convertCsvFileToJson(file.path)
      //   .then(this.aggregateData);
    });
  }

  public async doWork(): Promise<any> {
    const url = this.getSnowDepthUrl();

    const download = await this.downloadToFile(url, `/www/ts-node-api/tmp/test.csv`);

    console.log('Download:', download);

    const result = this.dataTransformer.convertCsvFileToJson(download.path);

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

  private getSnowDepthUrl(): string {
    const dateToday = moment();
    const startDate = dateToday.format('YYYY-MM-DD');
    const endDate = startDate;

    return `http://www.nwac.us/data-portal/csv/location/mt-hood/sensortype/snow_depth/start-date/${startDate}/end-date/${endDate}/`;
  }

  /**
   * TODO: move this to a proper service
   */
  aggregateData(data: any) {
    const dailyData = this.aggregateDailySnowDepthData(data);

    console.log('Daily Data:', dailyData);
  }

  /**
   * TODO: move this to a proper service
   */
  aggregateDailySnowDepthData(data) {

  }
}
