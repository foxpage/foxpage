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
export class SetPageVersionStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set page content version deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('pages/version-status')
  @Put('templates/version-status')
  @Put('blocks/version-status')
  @OpenAPI({
    summary: i18n.sw.setPageVersionStatus,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-version-status',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<ContentVersion>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: apiType });
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051601);
      }

      const result = await this.service.version.info.setVersionDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.page.invalidVersionId, 2051601);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.versionCannotBeDeleted, 2051602);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      this.service.relation.removeVersionRelations({ versionIds: [params.id] });

      return Response.success(versionDetail, 1051601);
    } catch (err) {
      return Response.error(err, i18n.page.setPageVersionDeletedFailed, 3051601);
    }
  }
}
