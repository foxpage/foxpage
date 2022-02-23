import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { PageContentData } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class GetPageLivesList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the specified page under the application
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/lives')
  @OpenAPI({
    summary: i18n.sw.getAppPages,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-live-version-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentVersionReq): Promise<ResData<PageContentData[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const pageList: ContentVersion[] = await this.service.content.live.getContentLiveDetails({
        applicationId: params.applicationId,
        type: TYPE.PAGE as FileTypes,
        contentIds: params.ids || [],
      });

      return Response.success(_.map(pageList, 'content'), 1051001);
    } catch (err) {
      return Response.error(err, i18n.condition.getAppPageFailed, 3051001);
    }
  }
}
