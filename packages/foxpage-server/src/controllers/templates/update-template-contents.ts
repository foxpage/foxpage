import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, UpdateContentReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class UpdateTemplateContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the content information of the template, including title and tags fields
   * @param  {UpdateContentReq} params
   * @returns {Content}
   */
  @Put('/contents')
  @OpenAPI({
    summary: i18n.sw.updateTemplateContentDetail,
    description: '/template/detail',
    tags: ['Template'],
    operationId: 'update-template-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateContentReq): Promise<ResData<Content>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEMPLATE });

      const [hasAuth, sourceContentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4071601);
      }

      _.remove(sourceContentDetail.tags, (tag) => {
        return _.isNil(tag.isBase) || _.isNil(tag.extendId);
      });

      params.isBase && params.tags.push({ isBase: params.isBase });
      params.extendId && params.tags.push({ extendId: params.extendId });

      const result = await this.service.content.info.updateContentDetail(
        Object.assign({}, params, { type: <FileTypes>TYPE.TEMPLATE }),
        { ctx, actionType: [LOG.UPDATE, TYPE.TEMPLATE].join('_') },
      );

      if (result.code === 1) {
        return Response.warning(i18n.template.invalidTemplateContentId, 2071601);
      } else if (result.code === 2) {
        return Response.warning(i18n.template.invalidIdType, 2071602);
      } else if (result.code === 3) {
        return Response.warning(i18n.template.templateNameExist, 2071603);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1071601);
    } catch (err) {
      return Response.error(err, i18n.template.updateTemplateContentFailed, 3071601);
    }
  }
}
