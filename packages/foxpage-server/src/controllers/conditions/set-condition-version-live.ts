import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentLiveReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class SetConditionLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the conditions
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/live-versions')
  @OpenAPI({
    summary: i18n.sw.setConditionContentLive,
    description: '',
    tags: ['Condition'],
    operationId: 'set-condition-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentLiveReq): Promise<ResData<Content>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // Permission check
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4100901);
      }

      const result = await this.service.content.live.setLiveVersion(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2100901);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionIsNotReleaseStatus, 2100902);
      } else if (result.code === 3) {
        const contentResult: any = JSON.parse(<string>result.data);
        if (contentResult.code === 3) {
          return Response.warning(
            i18n.content.RelationInfoNotExist + ':' + contentResult.data.join(','),
            2100903,
          );
        } else if (contentResult.code === 4) {
          return Response.warning(i18n.content.RelationDependRecursive + ':' + contentResult.data, 2100904);
        }
      }

      await this.service.content.live.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1100901);
    } catch (err) {
      return Response.error(err, i18n.condition.setConditionStatusFailed, 3100901);
    }
  }
}
