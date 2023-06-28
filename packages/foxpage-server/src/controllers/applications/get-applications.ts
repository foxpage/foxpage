import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Application } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { CACHE, METHOD } from '../../../config/constant';
import cache from '../../third-parties/cache';
import metric from '../../third-parties/metric';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppListByIdsReq, AppListRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetApplicationList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the specified applications
   * @param  {AppListReq} params
   * @returns {AppInfo}
   */
  @Post('/list')
  @OpenAPI({
    summary: i18n.sw.getAppListByIds,
    description: '',
    tags: ['Application'],
    operationId: 'get-application-list-by-ids',
  })
  @ResponseSchema(AppListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppListByIdsReq): Promise<ResData<Application[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      let searchAppIds: string[] = [];
      let appList: Application[] = [];

      await Promise.all(
        params.applicationIds.map(async (appId) => {
          const appCache = await cache.get(CACHE.APP_DETAIL + appId);
          const appObject = JSON.parse(appCache || '{}');
          if (!appObject || _.isEmpty(appObject)) {
            searchAppIds.push(appId);
          } else {
            appList.push(appObject);
          }
        }),
      );

      if (searchAppIds.length > 0) {
        const searchAppList = await this.service.application.getDetailByIds(searchAppIds);
        searchAppList.forEach((appDetail) => {
          appList.push(appDetail);
          // cache was setting in check middleware
        });
      }

      appList.forEach((app) => {
        delete app.setting;
      });

      // send metric
      appList.length === 0 && metric.empty(ctx.request.url);

      return Response.success(appList, 1030501);
    } catch (err) {
      return Response.error(err, i18n.app.listError, 3030501);
    }
  }
}
