'use strict';

import path from 'path';

import bodyParser from 'koa-bodyparser';
import { createKoaServer } from 'routing-controllers';

import { LoggerMiddleware } from './middlewares/logger-middleware';
import { TokenMiddleware } from './middlewares/token-middleware';

export function startService() {
  try {
    // start the service
    const routingControllerOptions = {
      cors: {
        origin: false,
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
        credentials: true,
        'Content-Type': 'application/json;charset=utf-8',
      },
      defaultErrorHandler: false,
      routePrefix: '/',
      controllers: [path.resolve(__dirname, '../../', 'src/controllers/**/*.{js,ts}')],
      middlewares: [LoggerMiddleware, TokenMiddleware],
      defaults: {
        paramOptions: {
          required: true,
        },
      },
    };

    const app = createKoaServer(routingControllerOptions);

    app.use(bodyParser());

    return app.listen();
  } catch (err) {
    console.error(`Start system cause error: ${(err as Error).message}`);
  }
}
