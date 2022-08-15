import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddContentReq, ContentBaseDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class AddTemplateContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create template content details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('/contents')
  @OpenAPI({
    summary: i18n.sw.addTemplateContentDetail,
    description: '',
    tags: ['Template'],
    operationId: 'add-template-content-detail',
  })
  @ResponseSchema(ContentBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddContentReq): Promise<ResData<Content>> {
    try {
      !params.tags && (params.tags = []);
      const contentParams: Partial<Content> = {
        title: params.title,
        fileId: params.fileId,
        tags: params.tags,
      };

      // add special field to tag
      if (params.isBase) {
        params.tags.push({ isBase: params.isBase });
      }

      if (params.extendId) {
        params.tags.push({ extendId: params.extendId });
      }

      const contentDetail = this.service.content.info.addContentDetail(contentParams, {
        ctx,
        content: { relation: {}, schemas: [] },
        type: TYPE.TEMPLATE as FileTypes,
        actionType: [LOG.CREATE, TYPE.TEMPLATE].join('_'),
      });

      await this.service.content.info.runTransaction(ctx.transactions);
      const templateContentDetail = await this.service.content.info.getDetailById(contentDetail.id || '');

      ctx.logAttr = Object.assign(ctx.logAttr, { id: contentDetail.id, type: TYPE.TEMPLATE });

      return Response.success(templateContentDetail, 1070101);
    } catch (err) {
      return Response.error(err, i18n.template.addNewTemplateContentFailed, 3070101);
    }
  }
}
