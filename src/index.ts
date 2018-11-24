require('dotenv').config();

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';
import { DatabaseConnection } from './config/connection';
import { Routes } from './routes';

createConnection(DatabaseConnection)
  .then(async (connection) => {
    console.log('CONNECTION MADE???', connection);

    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next,
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined,
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        },
      );
    });

    // setup express app here
    // ...
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Enable CORS
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      res.header('Access-Control-Allow-Credentials', 'true');

      next();
    });

    // start express server
    app.listen(4040);

    console.log(
      'Express server has started on port 4040. Open http://localhost:4040/users to see results',
    );
  })
  .catch((error) => console.log(error));
