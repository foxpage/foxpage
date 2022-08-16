import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('mocks')
export class SetMockVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set mock content version delete status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/version-status')
  @OpenAPI({
    summary: i18n.sw.setMockVersionStatus,
    description: '',
    tags: ['Mock'],
    operationId: 'set-mock-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<ContentVersion>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.MOCK });
      const hasAuth = await this.service.auth.version(params.id, { ctx, mask: 4 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4191101);
      }

      const result = await this.service.version.info.setVersionDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, TYPE.MOCK].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.mock.invalidVersionId, 2191101);
      } else if (result.code === 2) {
        return Response.warning(i18n.mock.versionCannotBeDeleted, 2191102);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail, 1191101);
    } catch (err) {
      return Response.error(err, i18n.mock.seMockVersionDeletedFailed, 3191101);
    }
  }
}
