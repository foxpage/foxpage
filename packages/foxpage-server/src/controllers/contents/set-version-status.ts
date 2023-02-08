import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentStatus, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentStatusReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('content')
export class SetContentVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the status of the page version， base, discard, beta, alpha, release...
   * @param  {ContentStatusReq} params
   * @returns {ContentVersion}
   */
  @Put('/version/status')
  @OpenAPI({
    summary: i18n.sw.setContentVersionStatus,
    description: '',
    tags: ['Content'],
    operationId: 'set-content-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentStatusReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE });

      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4160901);
      }

      // Check the validity of the current page ID
      let contentDetail = await this.service.version.info.getDetailById(params.id);
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.content.invalidContentId, 2160901);
      }

      // TODO: Set the preconditions for the page version status,
      // for example, release needs to check the components in the dsl, and the relation-related status is release

      this.service.version.info.updateVersionItem(
        params.id,
        { status: params.status as ContentStatus },
        { ctx },
      );

      await this.service.version.info.runTransaction(ctx.transactions);
      contentDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(contentDetail, 1160901);
    } catch (err) {
      return Response.error(err, i18n.content.setContentVersionStatusFailed, 3160901);
    }
  }
}
