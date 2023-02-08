import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { VersionPublish } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatusReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetPageVersionPublishAndLiveStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the page content version,
   * only the base status can be changed to other statuses, such as beta, release, etc.
   *
   * When publishing the page, if the page has dependent data other than the template and the data is updated,
   * all dependent data will be published
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('pages/publish')
  @Put('templates/publish')
  @Put('blocks/publish')
  @OpenAPI({
    summary: i18n.sw.setPageVersionPublishLiveStatus,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-version-publish-and-live-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: VersionPublishStatusReq): Promise<ResData<ContentVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051301);
      }

      // Set publishing status
      const [result, validateResult] = await Promise.all([
        this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
          ctx,
          liveRelation: true,
        }),
        this.service.version.check.versionCanPublish(params.id),
      ]);

      if (result.code === 1) {
        return Response.warning(i18n.page.pageVersionHasPublished, 2051301);
      } else if (!validateResult.publishStatus) {
        return Response.warning(i18n.page.invalidVersionData, 2051302, validateResult);
      }

      if (result?.data) {
        this.service.content.live.setLiveContent(
          result?.data?.contentId,
          result?.data?.versionNumber,
          params.id,
          {
            ctx,
            content: { id: result?.data?.contentId } as Content,
            actionType: [LOG.LIVE, apiType].join('_'),
          },
        );
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.live.getDetailById(params.id);

      return Response.success(versionDetail, 1051301);
    } catch (err) {
      return Response.error(err, i18n.page.setPagePublishStatusFailed, 3051301);
    }
  }
}
