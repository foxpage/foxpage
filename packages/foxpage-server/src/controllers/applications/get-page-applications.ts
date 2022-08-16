import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { GetApplicationListRes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppListReq, AppListRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('application-searchs')
export class GetApplicationPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a pagination list of application in a single organization
   * @param  {AppListReq} params
   * @returns {AppInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.appList,
    description: 'apps',
    tags: ['Application'],
    operationId: 'get-application-list',
  })
  @ResponseSchema(AppListRes)
  async index (@Ctx() ctx: FoxCtx, @QueryParams() params: AppListReq): Promise<ResData<GetApplicationListRes>> {
    params.search = params && params.search ? params.search : '';

    try {
      this.service.application.setPageSize(params);

      const result = await this.service.application.getPageList(
        Object.assign({}, _.omit(params, 'type'), {
          creator: params.type === TYPE.USER ? ctx.userInfo.id : ''
        })
      );
      return Response.success(result, 1030701);
    } catch (err) {
      return Response.error(err, i18n.app.listError, 3030701);
    }
  }
}
