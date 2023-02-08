import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, ContentLiveReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('content')
export class SetContentLiveVersion extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the page
   * @param  {ContentLiveReq} params
   * @returns {Content}
   */
  @Put('/version/live')
  @OpenAPI({
    summary: i18n.sw.setContentVersionLive,
    description: '',
    tags: ['Content'],
    operationId: 'set-content-version-live',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentLiveReq): Promise<ResData<Content>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.content(params.contentId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4160801);
      }

      // Get the specified version details,
      // if the version does not exist, or the version status is not release, return a prompt message
      const [versionDetail, contentDetail] = await Promise.all([
        this.service.version.info.getDetail(params),
        this.service.content.info.getDetailById(params.contentId),
      ]);

      if (this.notValid(versionDetail) || versionDetail.status !== VERSION.STATUS_RELEASE) {
        return Response.warning(i18n.content.invalidVersionOrStatus, 2160801);
      }

      // The content page does not exist or has been deleted
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.content.invalidContentId, 2160802);
      }

      // Set live version
      this.service.content.info.updateContentItem(
        params.contentId,
        { liveVersionNumber: params.versionNumber },
        { ctx },
      );

      await this.service.content.info.runTransaction(ctx.transactions);
      const newContentDetail = await this.service.content.info.getDetailById(params.contentId);

      return Response.success(newContentDetail, 1160801);
    } catch (err) {
      return Response.error(err, i18n.content.setContentVersionStatusFailed, 3160801);
    }
  }
}
