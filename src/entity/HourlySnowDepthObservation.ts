import {Entity, ObjectIdColumn, ObjectID, Column} from 'typeorm';

@Entity('hourly_snow_depth_observations')
export class HourlySnowDepthObservation {

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
  snowDepth: number;
}
