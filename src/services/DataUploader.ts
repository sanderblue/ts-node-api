import * as mongodb from 'mongodb';

interface InsertManyPayload {
  collection: string;
  data: Array<any>;
}

export class DataUploader {
  constructor() {}

  uploadMultiple(url: string, payloads: Array<any>): Promise<any> {
     let promises: Promise<any>[] = [];

     for (let i = 0; i < payloads.length; i++) {
       let uploadPromise = this.upload(
         url,
         payloads[i].collection,
         payloads[i].data
       );

       promises.push(uploadPromise);
     }

    return Promise.all(promises);
  }

  upload(
    url: string,
    collection: string,
    data: Array<any> = []
  ): Promise<any> {
    return new Promise((resolve: any) => {
      mongodb.MongoClient.connect(url, (err: Error, db: any) => {
        db.collection(collection)
          .insertMany(data)
          .then((result: any) => {
            console.log(`Succesfully added data to the ${collection} collection.`);
            console.log('Closing connection.');

            db.close();

            resolve({
              collection: collection,
              data: data,
            });
          }
        );
      });
    });
  }

  findAndModifyDocument(
    url: string,
    collection: string,
    doc,
    upsert: boolean = true
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      const options = {
        poolSize: 100,
        keepAlive: 40000, // default: 30000
      };

      mongodb.MongoClient.connect(url, options, (err: Error, db: any) => {
        if (err) {
          console.log('Mongo error:', err);
          return reject(err);
        }

        db.collection(collection)
          .findAndModify(
            {
              date: doc.date,
              location: doc.location
            },
            [],
            doc,
            { upsert: true }
          )
          .then((result: any) => {
            console.log(`Succesfully added data to the ${collection} collection.`);
            console.log('Closing connection.');

            db.close();

            resolve({
              collection: collection,
              data: doc,
            });
          })
        ;
      });
    });
  }
}
