import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatusReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class SetComponentVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the component content version,
   * only the base status can be changed to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-publish')
  @OpenAPI({
    summary: i18n.sw.setComponentVersionPublishStatus,
    description: '',
    tags: ['Component'],
    operationId: 'set-component-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: VersionPublishStatusReq): Promise<ResData<ContentVersion>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111601);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.component.componentVersionHasPublished, 2111601);
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(versionDetail, 1111601);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentPublishStatusFailed, 3111601);
    }
  }
}
