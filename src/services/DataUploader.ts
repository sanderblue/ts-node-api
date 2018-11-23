import * as mongodb from 'mongodb';
import { logger } from '../logger/logger';
import { TreeChildren } from 'typeorm';

interface InsertManyPayload {
  collection: string;
  data: any[];
}

export class DataUploader {
  private logger;

  private db;

  constructor(connUrl: string) {
    this.logger = logger;

    mongodb.MongoClient.connect(
      connUrl,
      (err: Error, db: any) => {
        this.db = db;

        console.log('Connected...');
      },
    );
  }

  public async uploadMultiple(url: string, payloads: Array<any>): Promise<any> {
    const promises: Promise<any>[] = [];
    const payload = payloads[0];
    const snowData = payload.data;

    for (let i = 0; i < snowData.length; i++) {
      promises.push(this.findAndModify(payload.collection, snowData[i]));
    }

    const result = await Promise.all(promises);
    this.db.close();
  }

  public async findAndModify(collection, doc) {
    try {
      return await this.db.collection(collection).findAndModify(
        {
          date: doc.date,
          location: doc.location,
        },
        [],
        doc,
        { upsert: true },
      );
    } catch (err) {
      this.logger.error(`ERROR: ${err.message}`);
    }
  }

  public upload(
    url: string,
    collection: string,
    data: Array<any> = [],
  ): Promise<any> {
    return new Promise((resolve: any) => {
      mongodb.MongoClient.connect(
        url,
        (err: Error, db: any) => {
          db.collection(collection)
            .insertMany(data)
            .then((result: any) => {
              // console.log(`Succesfully added data to the ${collection} collection.`);
              // console.log('Closing connection.');

              db.close();

              resolve({ collection: collection, data: data });
            });
        },
      );
    });
  }

  /**
   * @deprecated
   */
  public findAndModifyDocument(
    url: string,
    collection: string,
    doc,
    upsert: boolean = true,
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      const options = { poolSize: 100, keepAlive: 40000 }; // default: 30000

      mongodb.MongoClient.connect(
        url,
        options,
        (err: Error, db: any) => {
          if (err) {
            console.log('Mongo error:', err);
            return reject(err);
          }

          db.collection(collection)
            .findAndModify(
              {
                date: doc.date,
                location: doc.location,
              },
              [],
              doc,
              { upsert: true },
            )
            .then((result: any) => {
              // console.log(`Succesfully added data to the ${collection} collection.`);
              // console.log('Closing connection.');

              db.close();

              resolve({ collection: collection, data: doc });
            });
        },
      );
    });
  }
}
