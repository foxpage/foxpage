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
import _ from 'lodash';

// migration to pages/add-page-content.ts
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
  @Post('/contents-migrations')
  @OpenAPI({
    summary: i18n.sw.addTemplateContentDetail,
    description: '',
    tags: ['Template'],
    operationId: 'add-template-content-detail',
  })
  @ResponseSchema(ContentBaseDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddContentReq): Promise<ResData<Content>> {
    try {
      // Check permission
      const hasAuth = await this.service.auth.file(params.fileId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4050101);
      }

      !params.tags && (params.tags = []);

      const locales: Record<string, string>[] = _.remove(params.tags, (tag) => {
        return tag.locale;
      });

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

      if (params.oneLocale && locales.length > 0) {
        locales.forEach((locale) => {
          const localeContentParams = _.cloneDeep(contentParams);
          localeContentParams.tags?.push(locale);
          localeContentParams.title += '_' + (locale.locale || '');
          this.service.content.info.addContentDetail(localeContentParams, {
            ctx,
            content: { relation: params.content?.relation || {}, schemas: params.content?.schemas || [] },
            type: TYPE.PAGE as FileTypes,
            actionType: [LOG.CREATE, TYPE.PAGE].join('_'),
          });
        });
      } else {
        contentParams.tags?.push(...locales);
        this.service.content.info.addContentDetail(contentParams, {
          ctx,
          content: { relation: params.content?.relation || {}, schemas: params.content?.schemas || [] },
          type: TYPE.PAGE as FileTypes,
          actionType: [LOG.CREATE, TYPE.PAGE].join('_'),
        });
      }

      await this.service.content.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEMPLATE });

      return Response.success(i18n.template.addNewTemplateContentSuccess, 1070101);
    } catch (err) {
      return Response.error(err, i18n.template.addNewTemplateContentFailed, 3070101);
    }
  }
}
