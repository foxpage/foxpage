import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

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

@JsonController('mocks')
export class SetMockPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the mock content version,
   * which can only be changed from the base status to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-publish')
  @OpenAPI({
    summary: i18n.sw.setMockVersionPublishStatus,
    description: '',
    tags: ['Mock'],
    operationId: 'set-mock-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: VersionPublishStatusReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.MOCK });

      const hasAuth = await this.service.auth.version(params.id, { ctx, mask: 8 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4191001);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
        ctx,
        liveRelation: true,
      });

      if (result.code === 1) {
        return Response.warning(i18n.mock.mockVersionHasPublished, 2191001);
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail, 1191001);
    } catch (err) {
      return Response.error(err, i18n.mock.setMockPublishStatusFailed, 3191001);
    }
  }
}
