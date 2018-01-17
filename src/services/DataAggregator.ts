import { _ } from 'lodash';
import { DailySnowDepthObservation } from '../entity/DailySnowDepthObservation';
import { HourlySnowDepthObservation } from '../entity/HourlySnowDepthObservation';

export class DataAggregator {
  constructor() {}

  public extractLocationsFromData(data: Array<object>) {
    return [...new Set(data.map((item: any) => item.location))];
  }

  /**
   * TODO: move this to a proper service
   */
  public aggregateData(data: any) {
    const dailyData = this.aggregateDailySnowDepthData(data);

    // console.log('Daily Data:', dailyData);

    return dailyData;
  }

  /**
   * TODO: move this to a proper service
   */
  public aggregateDailySnowDepthData(data) {
    const locations = this.extractLocationsFromData(data);

    let arraysOfData: any[] = [];
    let aggregatedData: DailySnowDepthObservation[];
    let groupedByLocation = _.groupBy(data, 'location');

    _.forIn(groupedByLocation, (locationData: Array<object>, location: string) => {
      let dailyDataResult = this.aggregateDailyValuesForLocation(locationData, location);

      // console.log('dailyDataResult', dailyDataResult);

      arraysOfData.push(dailyDataResult);
    });

    return _.flatten(arraysOfData);
  }

  public aggregateDailyValuesForLocation(data: any, location: string) {
    let groupedByDate = _.groupBy(data, 'date');

    // console.log('groupedByDate', groupedByDate);

    return _.map(groupedByDate, (groupedData: Array<HourlySnowDepthObservation>, date: string) => {
      let hourlyObservations = this.mapHourlyObservations(groupedData);
      let hourlyObservationValues: Array<number> = _.map(hourlyObservations, 'snowDepth');
      let accurateHourlyValues = this.getAccurateHourlyObservationData(hourlyObservationValues);
      let average: any = _.mean(accurateHourlyValues);

      // console.log('_.head(hourlyObservations).location', _.head(hourlyObservations).location);

      return {
        timestamp: new Date(date).getTime(),
        date: date,
        location: location,
        elevation: _.head(groupedData).elevation,
        averageSnowDepthForDate: _.toNumber(average.toFixed(2)),
        hourlyObservations: accurateHourlyValues,
      };
    });
  }

  public getAccurateHourlyObservationData(values: Array<number>): Array<number> {
    let potentiallyInaccurateMeanValue = _.mean(values);
    let stdDvtn = this.calculateStandardDeviation(values);

    let allowedMinVal = potentiallyInaccurateMeanValue - stdDvtn;
    let allowedMaxVal = potentiallyInaccurateMeanValue + stdDvtn;

    return _.filter(values, (value: any) => {
      if (value < 0) {
        return false;
      }

      if (value === allowedMinVal) {
        return true;
      }

      if (value === allowedMaxVal) {
        return true;
      }

      return value > allowedMinVal && value < allowedMaxVal;
    });
  }

  public mapHourlyObservations(data: any): Array<object> {
    return _.map(data, (obj: any) => {
      let snowDepth = parseFloat(obj.snowDepth);

      return {
        timestamp: obj.timestamp,
        snowDepth: snowDepth > 0 ? _.toNumber(snowDepth.toFixed(3)) : 0,
        location: obj.location,
      }
    });
  }

  public calculateStandardDeviation(values: Array<number>): number {
    let mean = _.mean(values);
    let varianceValues = _.map(values, (n: number) => {
      let diff = mean - n;
      let variance = (diff * diff);

      return variance;
    });

    let avgVariance = _.mean(varianceValues);

    return Math.sqrt(avgVariance);
  }
}
