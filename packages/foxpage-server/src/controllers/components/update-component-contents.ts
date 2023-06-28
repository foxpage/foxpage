import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { UpdateComponentContentReq } from '../../types/validates/component-validate-types';
import { ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class UpdateComponentContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update component content information, currently only the content label information can be updated
   * @param  {UpdateComponentContentReq} params
   * @returns {ContentVersion}
   */
  @Put('/contents')
  @OpenAPI({
    summary: i18n.sw.updateComponentContentDetail,
    description: '',
    tags: ['Component'],
    operationId: 'update-component-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateComponentContentReq): Promise<ResData<Content>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111801);
      }

      const result = await this.service.content.info.updateContentDetail(
        {
          applicationId: params.applicationId,
          id: params.id,
          tags: params.tags || [],
          type: TYPE.COMPONENT as FileTypes,
        },
        { ctx, actionDataType: TYPE.COMPONENT },
      );

      if (result.code === 1 || result.code === 2) {
        return Response.warning(i18n.component.invalidContentId, 2111801);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      const contentDetail = await this.service.content.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(contentDetail, 1111801);
    } catch (err) {
      return Response.error(err, i18n.component.updateComponentContentFailed, 3111801);
    }
  }
}
