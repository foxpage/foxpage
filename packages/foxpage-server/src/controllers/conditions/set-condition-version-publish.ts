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

@JsonController('conditions')
export class SetConditionVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the conditional content version,
   * only the base status can be changed to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-publish')
  @OpenAPI({
    summary: i18n.sw.setConditionVersionPublishStatus,
    description: '',
    tags: ['Condition'],
    operationId: 'set-condition-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: VersionPublishStatus2Req,
  ): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // one of content id or version id must valid
      if (!params.id && !params.contentId) {
        return Response.warning(i18n.condition.invalidConditionId, 2101001);
      }

      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4101001);
      }

      if (!params.id) {
        const versionDetail = await this.service.version.info.getContentLatestVersion({
          contentId: params.contentId,
        });
        params.id = versionDetail.id;
      }

      if (!params.id) {
        return Response.warning(i18n.condition.invalidConditionId, 2101002);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(<VersionPublish>params, {
        ctx,
        liveRelation: true,
        actionType: [LOG.PUBLISH, TYPE.CONDITION].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.condition.conditionVersionHasPublished, 2101003);
      }
      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.live.getDetailById(params.id);

      return Response.success(versionDetail, 1101001);
    } catch (err) {
      return Response.error(err, i18n.condition.setConditionPublishStatusFailed, 3101001);
    }
  }
}
