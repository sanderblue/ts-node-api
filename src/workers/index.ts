import * as yargs from 'yargs';

import {Worker} from './worker';

console.log('Yargs:', yargs.argv);

const options = {
  startDate: yargs.argv.startDate,
  endDate: yargs.argv.endDate,
};

const worker = new Worker(options);


worker.doWork();
