import * as fs from 'fs';
import * as moment from 'moment';

import csv from 'csvtojson';
import _ from 'lodash';

import { CsvDataHelper } from './csv-data-helper';

export default class DataTransformer {

  private csvDataHelper: CsvDataHelper;

  constructor() {
    this.csvDataHelper = new CsvDataHelper();
  }

  public convertCsvFileToJson(filePath: string) {
    const readStream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      csv()
        .fromStream(readStream)
        .on('json', (data: any) => {

          console.log('DATA:', data);

          resolve(data);


          // _.forIn(data, (value, key) => {

          // });
        })
        .on('done', (error: any) => {
          console.log('Finished.');

          readStream.close();
        })
      ;
    });
  }
}
