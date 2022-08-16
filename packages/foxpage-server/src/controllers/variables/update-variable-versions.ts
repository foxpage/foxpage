import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  ContentVersionUpdateReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class UpdateVariableVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update variable content version information, including version number and content
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('/versions')
  @OpenAPI({
    summary: i18n.sw.updateVariableVersionDetail,
    description: '',
    tags: ['Variable'],
    operationId: 'update-variable-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionUpdateReq): Promise<ResData<ContentVersion>> {
    try {
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4081401);
      }

      const result = await this.service.version.info.updateVersionDetail(params, {
        ctx,
        actionType: [LOG.UPDATE, TYPE.VARIABLE].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.variable.invalidVersionId, 2081401);
      } else if (result.code === 2) {
        return Response.warning(i18n.variable.unEditedStatus, 2081402);
      } else if (result.code === 3) {
        return Response.warning(i18n.variable.versionExist, 2081403);
      } else if (result.code === 4) {
        return Response.warning(i18n.variable.missingFields + (<string[]>result.data).join(','), 2081404);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(<string>result.data);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>result.data, type: TYPE.VARIABLE });

      return Response.success(versionDetail, 1081401);
    } catch (err) {
      return Response.error(err, i18n.variable.updateVariableVersionFailed, 3081401);
    }
  }
}
