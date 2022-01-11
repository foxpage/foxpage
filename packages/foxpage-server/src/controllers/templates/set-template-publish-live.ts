import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { VersionPublish } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatusReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class SetPageVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the template content version,
   * which can only be changed from the base status to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/publish')
  @OpenAPI({
    summary: i18n.sw.setTemplateVersionPublishLiveStatus,
    description: '',
    tags: ['Template'],
    operationId: 'set-template-version-publish-and-live-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: VersionPublishStatusReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEMPLATE });

      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
        ctx,
        liveRelation: true,
      });

      if (result.code === 1) {
        return Response.warning(i18n.template.templateVersionHasPublished);
      } else if (result.code === 2) {
        return Response.warning(i18n.template.invalidRelations + ':' + Object.keys(result.data).join(','));
      }

      if (result?.data) {
        this.service.content.live.setLiveContent(result?.data?.contentId, result?.data?.versionNumber, {
          ctx,
          content: { id: result?.data?.contentId } as Content,
        });
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail || {});
    } catch (err) {
      return Response.error(err, i18n.template.setTemplatePublishStatusFailed);
    }
  }
}
