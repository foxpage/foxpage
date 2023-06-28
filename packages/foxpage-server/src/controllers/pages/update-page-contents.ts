import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, UpdateContentReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdatePageContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the content information of the page, including title and tags fields
   * @param  {UpdateContentReq} params
   * @returns {Content}
   */
  @Put('pages/contents')
  @Put('templates/contents')
  @Put('blocks/contents')
  @OpenAPI({
    summary: i18n.sw.updatePageContentDetail,
    description: '',
    tags: ['Page'],
    operationId: 'update-page-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateContentReq): Promise<ResData<Content>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      const [hasAuth, sourceContentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051701);
      }

      _.remove(sourceContentDetail.tags, (tag) => {
        return _.isNil(tag.isBase) || _.isNil(tag.extendId);
      });

      params.isBase && params.tags.push({ isBase: params.isBase });
      params.extendId && params.tags.push({ extendId: params.extendId });

      const result = await this.service.content.info.updateContentDetail(
        Object.assign({}, params, { type: apiType as FileTypes }),
        { ctx, actionDataType: apiType, actionType: [LOG.UPDATE, apiType].join('_') },
      );

      if (result.code === 1) {
        return Response.warning(i18n.page.invalidPageContentId, 2051701);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.invalidIdType, 2051702);
      } else if (result.code === 3) {
        return Response.warning(i18n.page.pageNameExist, 2051703);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1051701);
    } catch (err) {
      return Response.error(err, i18n.page.updatePageContentFailed, 3051701);
    }
  }
}
