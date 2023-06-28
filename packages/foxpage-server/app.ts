/* eslint-disable import/first */
'use strict';

import dotenv from 'dotenv';

dotenv.config();

import { writeFile } from 'fs';
import path from 'path';

import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import bodyParser from 'koa-bodyparser';
import router from 'koa-router';
import serve from 'koa-static';
import { koaSwagger } from 'koa2-swagger-ui';
import { createKoaServer, getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';

import { checkMiddleware, loggerMiddleware, tokenMiddleware } from './src/middlewares';
import dbConnect from './src/utils/mongoose';

const { defaultMetadataStorage } = require('class-transformer/storage');

export function startService(options: { createSwagger?: boolean }) {
  try {
    dbConnect();

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
      controllers: [path.resolve(__dirname, './src/controllers/**/*.{js,ts}')],
      middlewares: [loggerMiddleware, tokenMiddleware, checkMiddleware],
      defaults: { paramOptions: { required: true } },
    };

    const app = createKoaServer(routingControllerOptions);

    app.use(bodyParser());

    // healthcheck
    app.use(
      new router()
        .all('/healthcheck', async (ctx: any) => {
          ctx.body = 'Hello Foxpage!';
        })
        .routes(),
    );

    app.use(serve(path.join(__dirname, './static')));
    if (options.createSwagger) {
      const schemas = validationMetadatasToSchemas({
        classTransformerMetadataStorage: defaultMetadataStorage,
        refPointerPrefix: '#/components/schemas/',
      });
      const storage = getMetadataArgsStorage();
      const spec = routingControllersToSpec(storage, routingControllerOptions, {
        components: {
          schemas,
          securitySchemes: {
            basicAuth: {
              scheme: 'basic',
              type: 'http',
            },
          },
        },
        info: {
          description: 'Generated with `Foxpage`',
          title: 'Foxpage server api list',
          version: '1.0.0',
        },
      });

      // Update the content of the swagger.json file
      writeFile(__dirname + '/static/swagger/swagger.json', JSON.stringify(spec), 'utf8', () => {});

      app.use(
        koaSwagger({
          routePrefix: '/swagger',
          swaggerOptions: {
            supportedSubmitMethods: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
            url: './swagger.json',
          },
        }),
      );
    }

    app.on('error', (err: Error) => {
      console.error(`Unexpected error: ${err.message}`);
    });

    process.on('exit', (code: number) => {
      console.log(`Process exit with code: ${code}`);
    });

    process.on('unhandledRejection', (err: Error) => {
      console.log(err);
      console.error(`Unhandled rejection: ${err.message}`);
    });

    return app;
  } catch (err) {
    console.error(`Start system cause error: ${(err as Error).message}`);
  }
}
