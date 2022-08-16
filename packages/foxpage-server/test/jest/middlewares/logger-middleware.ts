import _ from 'lodash';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

import { i18n } from '../../../app.config';
import { PRE, RESPONSE_LEVEL } from '../../../config/constant';
import { FoxCtx } from '../../../src/types/index-types';
import { generationId } from '../../../src/utils/tools';

@Middleware({ type: 'before' })
export class LoggerMiddleware implements KoaMiddlewareInterface {
  async use(ctx: FoxCtx, next: (err?: any) => Promise<any>): Promise<any> {
    const params = !_.isEmpty(ctx.request.body) ? ctx.request.body : ctx.request.query;
    ctx.operations = [];
    ctx.transactions = [];
    ctx.logAttr = { transactionId: generationId(PRE.TRAN), applicationId: params.applicationId || '' };
    ctx.userInfo = { id: '', account: '' };
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
    }
  }
}
