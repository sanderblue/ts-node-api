/**
 * Domain-specific class with helper methods to assist
 * in formatting CSV data in a particular way.
 */
export class CsvDataHelper {
  constructor() {}

  /**
   * Used for extracting the elevation value
   * from a CSV table head element.
   */
  public extractNumberFromKey(key: string): string {
    return key.replace(/\D+/g, '');
  }

  /**
   * Used for extracting location name value from
   * a CSV table head element.
   */
  public extractStringFromKey(key: string): string {
    return key.replace(/[^a-z]/gi, '');
  }

  public isDateTimeKey(key: string): boolean {
    return key.indexOf('Date/Time') !== -1;
  }
}
