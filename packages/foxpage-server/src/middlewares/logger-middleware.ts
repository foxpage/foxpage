import _ from 'lodash';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

import { LangEnums } from '@foxpage/foxpage-server-types';
import { createLogger } from '@foxpage/foxpage-shared';

import { config, i18n } from '../../app.config';
import { LOGGER_LEVEL, PRE, RESPONSE_LEVEL } from '../../config/constant';
import * as Service from '../services';
import metric from '../third-parties/metric';
import { FoxCtx } from '../types/index-types';
import { generationId } from '../utils/tools';

const logger = createLogger('server');

@Middleware({ type: 'before' })
export class LoggerMiddleware implements KoaMiddlewareInterface {
  async use(ctx: FoxCtx, next: (err?: any) => Promise<any>): Promise<any> {
    const params = (!_.isEmpty(ctx.request.body) ? ctx.request.body : ctx.request.query) as unknown as Record<
      string,
      any
    >;
    ctx.operations = [];
    ctx.userLogs = [];
    ctx.transactions = [];
    ctx.logAttr = {
      transactionId: generationId(PRE.TRAN),
      applicationId: (params.applicationId as string) || '',
    };
    ctx.userInfo = { id: '', account: '' };
    ctx.lang = <LangEnums>ctx.request.header?.lang || 'en'; // response language
    ctx.log = {
      requestTime: new Date().getTime(),
      responseTime: 0,
      tooks: 0,
      originUrl: <string>ctx.request.header?.url || '',
      request: _.pick(ctx.request, ['method', 'path', 'query', 'body']),
      user: '',
    };

    try {
      await next();
    } catch (err) {
      const error = err as any;
      // Return wrong result
      if (config.env === 'development') {
        console.log(err);
        console.log('from log middleware: ' + error.message);
      }

      if (error.httpCode === RESPONSE_LEVEL.ACCESS_DENY) {
        ctx.body = {
          code: RESPONSE_LEVEL.ACCESS_DENY,
          msg: i18n.system.accessDeny,
        };
      } else {
        ctx.body = {
          code: RESPONSE_LEVEL.WARNING,
          msg: error.message,
          err: error.errors || {},
        };
      }
    } finally {
      if (!ctx.body) {
        ctx.response.status = RESPONSE_LEVEL.NOT_FOUND;
        ctx.body = { code: RESPONSE_LEVEL.NOT_FOUND, msg: 'API Not Found' };
      }

      // Save logs
      ctx.log.responseTime = new Date().getTime();
      ctx.log.response = ctx.body;
      ctx.log.tooks = ctx.log.responseTime - ctx.log.requestTime;

      metric.request(
        ctx.log.request.method,
        ctx.log.request.path,
        ctx.log.tooks,
        params.applicationId || '',
        (<any>ctx.body).code || 0,
      );

      if ((<any>ctx.body).code === RESPONSE_LEVEL.SUCCESS) {
        Service.log.saveChangeLogs(ctx);
        Service.userLog.saveLogs(ctx);
      }

      // Save log to db
      if (config.saveRequestLog && config.env !== 'test' && ctx.request.url !== '/healthcheck') {
        try {
          Service.log.saveRequest({ ctx });
        } catch (err) {
          console.log('Save log error:' + (err as any).message);
        }
      }

      if (config.env === 'development') {
        // Print request information to the console
        const logLevel: number =
          (<any>ctx.body).code === RESPONSE_LEVEL.SUCCESS
            ? LOGGER_LEVEL.INFO
            : (<any>ctx.body).code < RESPONSE_LEVEL.ERROR
            ? LOGGER_LEVEL.WARN
            : LOGGER_LEVEL.ERROR;
        logger.log(logLevel, (<any>ctx.body).msg || '', [
          ctx.request.method,
          ctx.request.path,
          (<any>ctx.body).code || 0,
          ctx.log.tooks + 'ms',
        ]);

        const mmry = process.memoryUsage();
        const heapTotal = Math.round((mmry.heapTotal / (1024 * 1024)) * 100) / 100 + ' Mb';
        const heapUsed = Math.round((mmry.heapUsed / (1024 * 1024)) * 100) / 100 + ' Mb';
        const rss = Math.round((mmry.rss / (1024 * 1024)) * 100) / 100 + ' Mb';
        console.log(
          ctx.request.method + ' ' + ctx.request.path,
          'heapTotal: ' +
            heapTotal +
            ', heapUsed: ' +
            heapUsed +
            ', rss: ' +
            rss +
            ', tooks: ' +
            ctx.log.tooks +
            'ms, status: ' +
            (<any>ctx.body).code,
        );
      }
    }
  }
}
