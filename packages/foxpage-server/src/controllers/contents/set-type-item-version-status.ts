import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetTypeItemVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set type [variable|condition|function|mock|...] content version delete status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('variables/version-status')
  @Put('conditions/version-status')
  @Put('functions/version-status')
  @Put('mocks/version-status')
  @OpenAPI({
    summary: i18n.sw.setVariableVersionStatus,
    description: '',
    tags: ['Content'],
    operationId: 'set-type-item-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<ContentVersion>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: apiType });

      const [hasAuth, versionDetail] = await Promise.all([
        this.service.auth.version(params.id, { ctx }),
        this.service.version.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162101);
      }

      if (this.notValid(versionDetail)) {
        return Response.warning(i18n.content.invalidVersionId, 2162103);
      }

      const contentDetail = await this.service.content.info.getDetailById(versionDetail.contentId);
      if (
        this.notValid(contentDetail) ||
        contentDetail.applicationId !== params.applicationId ||
        contentDetail.type !== apiType
      ) {
        return Response.warning(i18n.content.invalidVersionId, 2162104);
      }

      const result = await this.service.version.info.setVersionDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2162101);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionCannotBeDeleted, 2162102);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      versionDetail.deleted = params.status;

      return Response.success(versionDetail, 1162101);
    } catch (err) {
      return Response.error(err, i18n.content.setContentVersionFailed, 3162101);
    }
  }
}
