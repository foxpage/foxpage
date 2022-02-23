import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddContentReq, ContentBaseDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class AddPageContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * New page content details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('/contents')
  @OpenAPI({
    summary: i18n.sw.addPageContentDetail,
    description: '',
    tags: ['Page'],
    operationId: 'add-page-content-detail',
  })
  @ResponseSchema(ContentBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddContentReq): Promise<ResData<Content>> {
    try {
      // Check permission
      const hasAuth = await this.service.auth.file(params.fileId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4050101);
      }

      // Check if the name already exists
      const nameExist = await this.service.content.check.checkExist({
        title: params.title,
        fileId: params.fileId,
        deleted: false,
      });
      if (nameExist) {
        return Response.warning(i18n.page.pageNameExist, 2050101);
      }

      const contentParams: Partial<Content> = {
        title: params.title,
        fileId: params.fileId,
        tags: params.tags || [],
      };
      const contentDetail = this.service.content.info.addContentDetail(contentParams, {
        ctx,
        type: TYPE.PAGE as FileTypes,
      });

      await this.service.content.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: contentDetail.id, type: TYPE.PAGE });

      return Response.success(contentDetail, 1050101);
    } catch (err) {
      return Response.error(err, i18n.page.addNewPageContentFailed, 3050101);
    }
  }
}
