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

@JsonController('components')
export class SetComponentVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set component content version deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-status')
  @OpenAPI({
    summary: i18n.sw.setComponentVersionStatus,
    description: '',
    tags: ['Component'],
    operationId: 'set-component-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<ContentVersion>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111701);
      }

      // TODO: check component referenced has deleted

      const result = await this.service.version.info.setVersionDeleteStatus(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.component.invalidVersionId, 2111701);
      } else if (result.code === 2) {
        return Response.warning(i18n.component.versionCannotBeDeleted, 2111702);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.COMPONENT });

      return Response.success(versionDetail, 1111701);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentVersionDeletedFailed, 3111701);
    }
  }
}
