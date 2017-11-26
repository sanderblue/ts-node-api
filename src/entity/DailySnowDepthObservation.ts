import {Entity, ObjectIdColumn, ObjectID, Column} from 'typeorm';

@Entity('daily_snow_depth_observations')
export class DailySnowDepthObservation {

  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  timestamp: number;

  @Column()
  date: string;

  @Column()
  location: string;

  @Column()
  elevation: number;

  @Column()
  averageSnowDepthForDate: number;

  @Column()
  hourlyObservations: Array<number>;
}
