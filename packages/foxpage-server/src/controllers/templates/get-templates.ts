import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { PageContentData } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentListRes, AppContentVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class GetAppTemplateList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the specified template under the application
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Post('/lives')
  @OpenAPI({
    summary: i18n.sw.getAppTemplates,
    description: '',
    tags: ['Template'],
    operationId: 'get-template-live-version-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentVersionReq): Promise<ResData<PageContentData[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });
      const pageList = await this.service.content.live.getContentLiveDetails({
        applicationId: params.applicationId,
        type: TYPE.TEMPLATE as FileTypes,
        contentIds: params.ids || [],
      });

      return Response.success(_.map(pageList, 'content'), 1070901);
    } catch (err) {
      return Response.error(err, i18n.template.getAppTemplatesFailed, 3070901);
    }
  }
}
