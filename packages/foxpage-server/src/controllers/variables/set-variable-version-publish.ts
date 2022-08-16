import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { VersionPublish } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatus2Req,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class SetVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the variable content version,
   * which can only be changed from the base status to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-publish')
  @OpenAPI({
    summary: i18n.sw.setVariableVersionPublishStatus,
    description: '',
    tags: ['Variable'],
    operationId: 'set-variable-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: VersionPublishStatus2Req,
  ): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.VARIABLE });

      // one of content id or version id must valid
      if (!params.id && !params.contentId) {
        return Response.warning(i18n.variable.invalidVariableId, 2081002);
      }

      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4081001);
      }

      if (!params.id) {
        const versionDetail = await this.service.version.info.getContentLatestVersion({
          contentId: params.contentId,
        });
        params.id = versionDetail.id;
      }

      if (!params.id) {
        return Response.warning(i18n.variable.invalidVariableId, 2081003);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
        ctx,
        liveRelation: true,
        actionType: [LOG.PUBLISH, TYPE.VARIABLE].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.variable.variableVersionHasPublished, 2081001);
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail, 1081001);
    } catch (err) {
      return Response.error(err, i18n.variable.setVariablePublishStatusFailed, 3081001);
    }
  }
}
