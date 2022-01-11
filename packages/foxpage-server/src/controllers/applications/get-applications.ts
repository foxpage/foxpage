import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Application } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
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

      const appList = await this.service.application.getDetailByIds(params.applicationIds);

      return Response.success(appList);
    } catch (err) {
      return Response.error(err, i18n.app.listError);
    }
  }
}
