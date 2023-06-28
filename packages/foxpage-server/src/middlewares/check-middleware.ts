import _ from 'lodash';
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers';

import { i18n } from '../../app.config';
import { CACHE, RESPONSE_LEVEL } from '../../config/constant';
import * as Service from '../services';
import cache from '../third-parties/cache';
import { FoxCtx } from '../types/index-types';

@Middleware({ type: 'before' })
export class CheckMiddleware implements KoaMiddlewareInterface {
  async use(ctx: FoxCtx, next: (err?: any) => Promise<any>): Promise<any> {
    const params = (!_.isEmpty(ctx.request.body) ? ctx.request.body : ctx.request.query) as unknown as Record<
      string,
      any
    >;

    // check application delete status
    let applicationIds: string[] = [];
    params.applicationId && (applicationIds = [params.applicationId]);
    params.applicationIds && (applicationIds = params.applicationIds);

    if (applicationIds.length === 0) {
      await next();
    } else {
      let invalidAppIds: string[] = [];
      let searchAppIds: string[] = [];
      await Promise.all(
        applicationIds.map(async (appId) => {
          const appCache = await cache.get(CACHE.APP_DETAIL + appId);
          const appObject = JSON.parse(appCache || '{}');

          if (_.isEmpty(appObject)) {
            searchAppIds.push(appId);
          } else if (appObject.deleted) {
            invalidAppIds.push(appId);
          }
        }),
      );

      if (searchAppIds.length > 0) {
        const appList = await Service.application.getDetailByIds(searchAppIds);
        const appObject = _.keyBy(appList, 'id');
        for (const appId of searchAppIds) {
          if (!appObject[appId] || _.isEmpty(appObject[appId]) || appObject[appId].deleted) {
            invalidAppIds.push(appId);
          }

          // check in every request, so set cache in middleware
          cache.set(CACHE.APP_DETAIL + appId, JSON.stringify(appObject[appId] || {}), 3600);
        }
      }

      if (invalidAppIds.length > 0) {
        ctx.body = {
          code: RESPONSE_LEVEL.WARNING,
          msg: i18n.app.invalidAppId + ': ' + invalidAppIds.join(','),
        };
      } else {
        await next();
      }
    }
  }
}
