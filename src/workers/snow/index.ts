import * as yargs from 'yargs';
import * as schedule from 'node-schedule';

import {Worker} from './worker';

const singleRun = yargs.argv.cron ? false : true;

if (yargs.argv.cron) {
  executeCron();
} else {
  execute(yargs.argv.startDate, yargs.argv.endDate);
}

function execute(
  startDate: Date = new Date(),
  endDate: Date = new Date()
) {
  console.log('Executing worker run at ', new Date().toLocaleString('en-US'));

  const options = {
    startDate: startDate,
    endDate: endDate,
  };

  const worker = new Worker(options);

  worker.doWork().then(() => {
    console.log('Work completed at ', new Date().toLocaleString('en-US'), '\n\n');
  });
}

/**
 * Runs a cron job at minute 00 every hour.
 *
 * e.g. 12:01am, 01:01am, 02:02am
 */
function executeCron() {
  schedule.scheduleJob('0 */1 * * *', () => {
    const startDate = new Date();
    const endDate = new Date();

    console.log('Running cron job at ', startDate.toLocaleString('en-US'));

    execute(startDate, endDate);
  });
}