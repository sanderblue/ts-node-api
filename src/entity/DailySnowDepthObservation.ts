import { Entity, ObjectIdColumn, ObjectID, Column, Index } from 'typeorm';

@Entity('daily_snow_depth_observations')
@Index(
  'location_date',
  (doc: DailySnowDepthObservation) => [doc.location, doc.date],
  { unique: true },
)
export class DailySnowDepthObservation {
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
  averageSnowDepthForDate: number;

  @Column()
  hourlyObservations: Array<number>;
}
