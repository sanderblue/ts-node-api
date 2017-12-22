import * as fs from 'fs';
import * as moment from 'moment';
import * as csv from 'csvtojson';

import { _ } from 'lodash';
import { CsvDataHelper } from './CsvDataHelper';

export class DataTransformer {

  private csvDataHelper: CsvDataHelper;

  constructor() {
    this.csvDataHelper = new CsvDataHelper();
  }

  public convertCsvFileToJson(filePath: string) {
    const readStream = fs.createReadStream(filePath);

    let json: any = {};

    return new Promise((resolve, reject) => {
      csv()
        .fromStream(readStream)
        .on('json', (data: any) => {
          json = data;
        })
        .on('done', (error: any) => {
          console.log('Finished.', error);

          readStream.close();

          if (error) {
            return reject(error);
          }

          return resolve(json);
        })
      ;
    });
  }

  public normalizeJson(data) {
    let observationsData: any[] = [];
    let observationDateTime: Date;
    let observationTimestamp: number;

    _.forIn(data, (value, key) => {
      let elevation: string;
      let location: string;
      let snowDepth: string;

      if (this.csvDataHelper.isDateTimeKey(key)) {
        observationDateTime = new Date(value);
        observationTimestamp = observationDateTime.getTime();
      } else {
        elevation = this.csvDataHelper.extractNumberFromKey(key);
        location = this.csvDataHelper.extractStringFromKey(key);
        snowDepth = value;

        observationsData.push({
          timestamp: observationTimestamp,
          date: moment(observationDateTime).format('YYYY-MM-DD'),
          location: location,
          elevation: _.toNumber(elevation),
          snowDepth: _.toNumber(value),
        });
      }
    });

    return observationsData;
  }
}
