import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { VersionPublish } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatusReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetPageVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the page content version,
   * only the base status can be changed to other statuses, such as beta, release, etc.
   * When publishing the page, if the page has dependent data other than the template and the data is updated,
   * all dependent data will be published
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('pages/version-publish')
  @Put('templates/version-publish')
  @Put('blocks/version-publish')
  @OpenAPI({
    summary: i18n.sw.setPageVersionPublishStatus,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: VersionPublishStatusReq): Promise<ResData<ContentVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051501);
      }

      const validateResult = await this.service.version.check.versionCanPublish(params.id);
      if (!validateResult.publishStatus) {
        return Response.warning(i18n.page.invalidVersionData, 2051502, validateResult);
      }

      // Set publishing status
      const result = await this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
        ctx,
        liveRelation: true,
      });

      if (result.code === 1) {
        return Response.warning(i18n.page.pageVersionHasPublished, 2051501);
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.live.getDetailById(params.id);

      return Response.success(versionDetail, 1051501);
    } catch (err) {
      return Response.error(err, i18n.page.setPagePublishStatusFailed, 3051501);
    }
  }
}
