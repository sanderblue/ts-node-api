import {getRepository} from 'typeorm';
import {NextFunction, Request, Response} from 'express';
import {DailySnowDepthObservation} from '../entity/DailySnowDepthObservation';

export class SnowDepthController {

  private dailySnowDepthRepository = getRepository(DailySnowDepthObservation);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.dailySnowDepthRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.dailySnowDepthRepository.findOneById(request.params.id);
  }

  async save(request: Request, response: Response, next: NextFunction) {
    return this.dailySnowDepthRepository.save(request.body);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    await this.dailySnowDepthRepository.removeById(request.params.id);
  }
}
