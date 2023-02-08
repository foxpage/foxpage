import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentDetailRes, UpdateContentReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdateTypeItemContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the type[variable|condition|function|mock|...] item content information, including title and tags fields
   * @param  {UpdateContentReq} params
   * @returns {Content}
   */
  @Put('variables/contents')
  @Put('conditions/contents')
  @Put('functions/contents')
  @Put('mocks/contents')
  @OpenAPI({
    summary: i18n.sw.updateVariableContentDetail,
    description: '',
    tags: ['Content'],
    operationId: 'update-type-item-content-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateContentReq): Promise<ResData<Content>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      let [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.pageContentId || params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162201);
      }

      if (
        this.notValid(contentDetail) ||
        contentDetail.applicationId !== params.applicationId ||
        contentDetail.type !== apiType
      ) {
        return Response.warning(i18n.content.invalidVersionId, 2162204);
      }

      const result = await this.service.content.info.updateContentDetail(
        Object.assign({}, params, { type: <FileTypes>apiType }),
        { ctx, actionType: [LOG.UPDATE, apiType].join('_') },
      );

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidContentId, 21622201);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.invalidContentId, 2162202);
      } else if (result.code === 3) {
        return Response.warning(i18n.content.typeItemNameExist, 2162203);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      contentDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(contentDetail, 1162201);
    } catch (err) {
      return Response.error(err, i18n.content.updateVariableContentFailed, 3162201);
    }
  }
}
