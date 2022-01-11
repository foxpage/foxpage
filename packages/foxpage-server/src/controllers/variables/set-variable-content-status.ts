import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class SetVariableContentStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set variable content deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/content-status')
  @OpenAPI({
    summary: i18n.sw.setVariableContentStatus,
    description: '',
    tags: ['Variable'],
    operationId: 'set-variable-content-status',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Content>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.VARIABLE });
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      const result = await this.service.content.info.setContentDeleteStatus(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.content.invalidContentId);
      } else if (result.code === 2) {
        return Response.warning(i18n.variable.contentCannotBeDeleted);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail);
    } catch (err) {
      return Response.error(err, i18n.variable.setVariableContentDeletedFailed);
    }
  }
}
