import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { merger } from '@foxpage/foxpage-core';
import { Content, ContentVersion, DslSchemas } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, SaveToBaseReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class SaveContentAsBase extends BaseController {
  constructor() {
    super();
  }

  /**
   * Save the special content to base data
   * @param  {SaveToBaseReq} params
   * @returns {ContentInfo}
   */
  @Post('/base')
  @OpenAPI({
    summary: i18n.sw.saveContentAsBase,
    description: '',
    tags: ['Content'],
    operationId: 'save-content-as-base',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: SaveToBaseReq): Promise<ResData<Content>> {
    try {
      // Get content detail
      const contentDetail = await this.service.content.info.getDetailById(params.contentId);

      // Get content extend detail
      const extensionObject = this.service.content.tag.getTagsByKeys(contentDetail.tags || [], ['extendId']);

      let extendContentDetail: Partial<Content> = {};
      if (extensionObject.extendId) {
        extendContentDetail = await this.service.content.info.getDetailById(extensionObject.extendId);
      }

      let contentVersionPromise: Promise<ContentVersion>[] = [];
      contentVersionPromise[0] = this.service.version.info.getDetail({
        contentId: contentDetail.id,
        versionNumber: contentDetail.liveVersionNumber,
      });

      if (extendContentDetail.id) {
        contentVersionPromise[1] = this.service.version.info.getDetail({
          contentId: extendContentDetail.id,
          versionNumber: extendContentDetail.liveVersionNumber,
        });
      }

      const [pageVersion, baseVersion] = await Promise.all(contentVersionPromise);

      // merge content
      let newContent = pageVersion?.content || {};
      if (baseVersion?.content) {
        newContent = merger.merge(baseVersion?.content || {}, pageVersion?.content || {}, {
          strategy: merger.MergeStrategy.COMBINE_BY_EXTEND,
        });
      }

      // update structure Id
      const newSchemas = this.service.version.info.updateVersionStructureId(
        newContent.schemas as DslSchemas[],
      ) as any;

      // save new base content
      const newContentDetail = this.service.content.info.create(
        {
          title: contentDetail.title + '_base',
          fileId: contentDetail.fileId,
          applicationId: contentDetail.applicationId,
          type: contentDetail.type || '',
          tags: [{ isBase: true }],
        },
        { ctx },
      );
      this.service.version.info.create(
        {
          contentId: newContentDetail.id,
          content: {
            schemas: newSchemas,
            relation: newContent.relation,
          },
        },
        { ctx },
      );

      await this.service.content.info.runTransaction(ctx.transactions);

      return Response.success(newContentDetail, 1161101);
    } catch (err) {
      return Response.error(err, i18n.content.saveToBaseFailed, 3161101);
    }
  }
}
