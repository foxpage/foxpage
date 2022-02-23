import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, UpdateContentReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class UpdateVariableContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the content information of variables, including title and tags fields
   * @param  {UpdateContentReq} params
   * @returns {Content}
   */
  @Put('/contents')
  @OpenAPI({
    summary: i18n.sw.updateVariableContentDetail,
    description: '',
    tags: ['Variable'],
    operationId: 'update-variable-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateContentReq): Promise<ResData<Content>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.VARIABLE });

      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4081201);
      }

      const result = await this.service.content.info.updateContentDetail(
        Object.assign({}, params, { type: <FileTypes>TYPE.VARIABLE }),
        { ctx },
      );

      if (result.code === 1) {
        return Response.warning(i18n.variable.invalidVariableContentId, 2081201);
      } else if (result.code === 2) {
        return Response.warning(i18n.variable.invalidIdType, 2081202);
      } else if (result.code === 3) {
        return Response.warning(i18n.variable.variableNameExist, 2081203);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1081201);
    } catch (err) {
      return Response.error(err, i18n.variable.updateVariableContentFailed, 3081201);
    }
  }
}
