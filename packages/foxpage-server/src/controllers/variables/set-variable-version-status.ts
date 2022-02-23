import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class SetVariableVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set variable content version delete status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-status')
  @OpenAPI({
    summary: i18n.sw.setVariableVersionStatus,
    description: '',
    tags: ['Variable'],
    operationId: 'set-variable-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<ContentVersion>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.VARIABLE });
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4081101);
      }

      const result = await this.service.version.info.setVersionDeleteStatus(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.variable.invalidVersionId, 2081101);
      } else if (result.code === 2) {
        return Response.warning(i18n.variable.versionCannotBeDeleted, 2081102);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail, 1081101);
    } catch (err) {
      return Response.error(err, i18n.variable.setVariableVersionDeletedFailed, 3081101);
    }
  }
}
