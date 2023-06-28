import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetTypeItemContentStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set type [variable|condition|function|mock|...] content deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('variables/content-status')
  @Put('conditions/content-status')
  @Put('functions/content-status')
  @Put('mocks/content-status')
  @OpenAPI({
    summary: i18n.sw.setVariableContentStatus,
    description: '',
    tags: ['Content'],
    operationId: 'set-type-item-content-status',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Content>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: apiType });

      // Permission and id check
      const [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4161901);
      }

      // content id is invalid or type is not mapping
      if (
        this.notValid(contentDetail) ||
        contentDetail.applicationId !== params.applicationId ||
        contentDetail.type !== apiType
      ) {
        return Response.warning(i18n.content.invalidContentId, 2161901);
      }

      const result = await this.service.content.info.setContentDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, apiType].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.content.invalidContentId, 2161902);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.contentCannotBeDeleted, 2161903);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      contentDetail.deleted = true;

      return Response.success(contentDetail, 1161901);
    } catch (err) {
      return Response.error(err, i18n.content.setTypeItemContentDeletedFailed, 3161901);
    }
  }
}
