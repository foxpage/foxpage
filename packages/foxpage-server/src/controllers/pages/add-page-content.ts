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

@JsonController()
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
  @Post('pages/contents')
  @Post('templates/contents')
  @Post('blocks/contents')
  @OpenAPI({
    summary: i18n.sw.addPageContentDetail,
    description: '',
    tags: ['Page'],
    operationId: 'add-page-content-detail',
  })
  @ResponseSchema(ContentBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddContentReq): Promise<ResData<string>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      // Check permission
      const hasAuth = await this.service.auth.file(params.fileId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4050101);
      }

      !params.tags && (params.tags = []);
      params.tags = this.service.content.tag.formatTags(TYPE.CONTENT, params.tags);
      const locales: Record<string, string>[] = _.remove(params.tags, (tag) => {
        return tag.locale;
      });

      // add special filed to tag
      if (params.isBase) {
        params.tags.push({ isBase: params.isBase });
      }

      if (params.extendId) {
        params.tags.push({ extendId: params.extendId });
      }

      const contentParams: Partial<Content> = {
        title: params.title,
        fileId: params.fileId,
        applicationId: params.applicationId,
        type: apiType,
        tags: params.tags,
      };

      if (params.oneLocale && locales.length > 0) {
        locales.forEach((locale) => {
          const localeContentParams = _.cloneDeep(contentParams);
          localeContentParams.tags?.push(locale);
          localeContentParams.title += '_' + (locale.locale || '');
          this.service.content.info.addContentDetail(localeContentParams, {
            ctx,
            content: { relation: params.content?.relation || {}, schemas: params.content?.schemas || [] },
            type: apiType as FileTypes,
            actionDataType: apiType,
          });
        });
      } else {
        contentParams.tags?.push(...locales);
        this.service.content.info.addContentDetail(contentParams, {
          ctx,
          content: { relation: params.content?.relation || {}, schemas: params.content?.schemas || [] },
          type: apiType as FileTypes,
          actionDataType: apiType,
        });
      }

      await this.service.content.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      return Response.success(i18n.page.addNewPageContentSuccess, 1050101);
    } catch (err) {
      return Response.error(err, i18n.page.addNewPageContentFailed, 3050101);
    }
  }
}
