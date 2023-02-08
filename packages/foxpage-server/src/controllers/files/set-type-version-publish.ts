import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
import { VersionPublish } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  VersionPublishStatus2Req,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetItemVersionPublishStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the release status of the item (variable, condition, function) content version,
   * which can only be changed from the base status to other statuses, such as beta, release, etc.
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('variables/version-publish')
  @Put('conditions/version-publish')
  @Put('functions/version-publish')
  @OpenAPI({
    summary: i18n.sw.setItemVersionPublishStatus,
    description: '',
    tags: ['File'],
    operationId: 'set-item-version-public-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: VersionPublishStatus2Req,
  ): Promise<ResData<ContentVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      // one of content id or version id must valid
      if (!params.id && !params.contentId) {
        return Response.warning(i18n.file.invalidItemId, 2170901);
      }

      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4170901);
      }

      let contentVersionDetail: Partial<ContentVersion> = {};
      if (!params.id) {
        contentVersionDetail = await this.service.version.info.getContentLatestVersion({
          contentId: params.contentId,
        });
      } else {
        contentVersionDetail = await this.service.version.info.getDetailById(params.id);
      }

      if (this.notValid(contentVersionDetail) || contentVersionDetail?.status !== VERSION.STATUS_BASE) {
        return Response.warning(i18n.file.invalidItemIdOrHasPublished, 2170902);
      }
      params.id = contentVersionDetail.id as string;

      let [itemDetail, validateResult] = await Promise.all([
        this.service.version.info.getDetailById(params.id),
        this.service.version.check.versionCanPublish(params.id),
      ]);

      if (!validateResult.publishStatus) {
        return Response.warning(i18n.page.invalidVersionData, 2170903, validateResult);
      }

      // Set publishing status
      const [result] = await Promise.all([
        this.service.version.live.setVersionPublishStatus(params as VersionPublish, {
          ctx,
          liveRelation: true,
        }),
        this.service.content.live.setLiveVersion(
          {
            applicationId: params.applicationId,
            id: params.contentId,
            versionNumber: itemDetail.versionNumber,
          },
          { ctx, force: true },
        ),
      ]);

      if (result.code === 1) {
        return Response.warning(i18n.file.itemVersionHasPublished, 2170904);
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      itemDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(itemDetail, 1170901);
    } catch (err) {
      return Response.error(err, i18n.file.setItemVersionPublishFailed, 3170901);
    }
  }
}
