import * as yargs from 'yargs';
import * as schedule from 'node-schedule';

import { Worker } from './Worker';
import { logger } from '../../logger/logger';

const singleRun = yargs.argv.cron ? false : true;

logger.log('info', 'Worker about to do work...');

// const worker = new Worker();
// worker.cleanUpData();


if (yargs.argv.cron) {
  executeCron();
} else {
  execute(yargs.argv.startDate, yargs.argv.endDate);
}

function execute(
  startDate: Date = new Date(),
  endDate: Date = new Date()
) {
  logger.info('Executing worker run at ', new Date().toLocaleString('en-US'));

  const options = {
    startDate: startDate,
    endDate: endDate,
  };

  const worker = new Worker(options);

  worker.doWork().then(() => {
    logger.info('Work completed at ', new Date().toLocaleString('en-US'));
  });
}

/**
 * Runs a cron job at minute 00 every hour.
 *
 * e.g. 12:01am, 01:01am, 02:02am
 */
function executeCron() {
  logger.info(`CRON job scheduled to run at 1 minute past every hour - i.e. 01:01, 02:01, 03:01`);

  schedule.scheduleJob('0 */1 * * *', () => {
    const startDate = new Date();
    const endDate = new Date();

    logger.info('Running cron job at ', startDate.toLocaleString('en-US'));

    execute(startDate, endDate);
  });
}
