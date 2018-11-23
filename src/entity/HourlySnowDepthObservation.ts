import { Entity, ObjectIdColumn, ObjectID, Column, Index } from 'typeorm';

@Entity('hourly_snow_depth_observations')
export class HourlySnowDepthObservation {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  timestamp: number;

  @Index()
  @Column()
  date: string;

  @Index()
  @Column()
  location: string;

  @Column()
  elevation: number;

  @Column()
  snowDepth: number;
}
