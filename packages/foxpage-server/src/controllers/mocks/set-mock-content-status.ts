import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('mocks')
export class SetMockContentStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set mock content deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/content-status')
  @OpenAPI({
    summary: i18n.sw.setMockContentStatus,
    description: '',
    tags: ['Mock'],
    operationId: 'set-mock-content-status',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Content>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.MOCK });
      const hasAuth = await this.service.auth.content(params.id, { ctx, mask: 4 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4190701);
      }

      const result = await this.service.content.info.setContentDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, TYPE.MOCK].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.content.invalidContentId, 4190702);
      } else if (result.code === 2) {
        return Response.warning(i18n.mock.contentCannotBeDeleted, 4190703);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1190701);
    } catch (err) {
      return Response.error(err, i18n.mock.setMockContentDeletedFailed, 3190701);
    }
  }
}
