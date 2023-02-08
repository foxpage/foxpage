import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionBaseUpdateReq,
  ContentVersionDetailRes,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class UpdateConditionVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the version content of the conditional content base
   * @param  {ContentVersionBaseUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('/base-versions')
  @OpenAPI({
    summary: i18n.sw.updateConditionBaseVersionDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'update-condition-base-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: ContentVersionBaseUpdateReq,
  ): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // Permission check
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4101201);
      }

      // Get the version number of base
      const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(params.id);
      if (!versionDetail) {
        return Response.warning(i18n.condition.invalidContentId, 2101201);
      }

      const versionParams = Object.assign({}, params, _.pick(versionDetail, ['id', 'version']));
      const result = await this.service.version.info.updateVersionDetail(versionParams, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.condition.invalidVersionId, 2101202);
      } else if (result.code === 2) {
        return Response.warning(i18n.condition.unEditedStatus, 2101203);
      } else if (result.code === 3) {
        return Response.warning(i18n.condition.versionExist, 2101204);
      } else if (result.code === 4) {
        return Response.warning(i18n.condition.missingFields + (<string[]>result.data).join(','), 2101205);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const contentVersionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(contentVersionDetail, 1101201);
    } catch (err) {
      return Response.error(err, i18n.content.updateConditionVersionFailed, 3101201);
    }
  }
}
