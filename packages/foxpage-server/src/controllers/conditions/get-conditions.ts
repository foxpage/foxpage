import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { PageContentData } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentVersionReq, PageContentDataRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class GetAppConditionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the live version of the specified conditions under the application
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/lives')
  @OpenAPI({
    summary: i18n.sw.getAppConditions,
    description: '',
    tags: ['Condition'],
    operationId: 'get-condition-live-version-list',
  })
  @ResponseSchema(PageContentDataRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentVersionReq): Promise<ResData<PageContentData[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      const contentVersionList = await this.service.content.live.getContentLiveDetails({
        applicationId: params.applicationId,
        type: TYPE.CONDITION as FileTypes,
        contentIds: params.ids || [],
      });

      return Response.success(_.map(contentVersionList, 'content'));
    } catch (err) {
      return Response.error(err, i18n.condition.getAppConditionFailed);
    }
  }
}
