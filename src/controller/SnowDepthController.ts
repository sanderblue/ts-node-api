import {getRepository} from 'typeorm';
import {NextFunction, Request, Response} from 'express';
import {DailySnowDepthObservation} from '../entity/DailySnowDepthObservation';
import {Worker} from '../workers/worker';

export class SnowDepthController {

  private dailySnowDepthRepository = getRepository(DailySnowDepthObservation);

  private worker: Worker;

  constructor() {
    this.worker = new Worker();
  }

  async all(req: Request, res: Response, next: NextFunction) {
    console.log('HERE!');

    // Enable CORS
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');

    return this.dailySnowDepthRepository.find();
  }

  async one(req: Request, res: Response, next: NextFunction) {
    return this.dailySnowDepthRepository.findOneById(req.params.id);
  }

  async save(req: Request, res: Response, next: NextFunction) {
    return this.dailySnowDepthRepository.save(req.body);
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    await this.dailySnowDepthRepository.removeById(req.params.id);
  }

  async download(req: Request, res: Response, next: NextFunction) {
    this.worker.doWork().then(() => {
      res.send('DONE');
    });
  }
}
