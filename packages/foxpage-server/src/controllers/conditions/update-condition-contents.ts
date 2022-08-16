import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, UpdateContentReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class UpdateContentBaseDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * The content information of the update condition, including the title and tags fields
   * @param  {UpdateContentReq} params
   * @returns {Content}
   */
  @Put('/contents')
  @OpenAPI({
    summary: i18n.sw.updateConditionDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'update-condition-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateContentReq): Promise<ResData<Content>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // Permission check
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4101301);
      }

      const result = await this.service.content.info.updateContentDetail(
        Object.assign({}, params, { type: TYPE.CONDITION as FileTypes }),
        { ctx, actionType: [LOG.UPDATE, TYPE.CONDITION].join('_') },
      );

      if (result.code === 1) {
        return Response.warning(i18n.condition.invalidConditionId, 2101301);
      } else if (result.code === 2) {
        return Response.warning(i18n.condition.invalidIdType, 2101302);
      } else if (result.code === 3) {
        return Response.warning(i18n.condition.conditionNameExist, 2101303);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1101301);
    } catch (err) {
      return Response.error(err, i18n.condition.updateConditionFailed, 3101301);
    }
  }
}
