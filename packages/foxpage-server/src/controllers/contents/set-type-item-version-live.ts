import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentLiveReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetTypeItemLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the type item [variable|condition|function|mock|...]
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('variables/live-versions')
  @Put('conditions/live-versions')
  @Put('functions/live-versions')
  @Put('mocks/live-versions')
  @OpenAPI({
    summary: i18n.sw.setVariableContentLive,
    description: '',
    tags: ['Content'],
    operationId: 'set-type-item-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentLiveReq): Promise<ResData<Content>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      let [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4162001);
      }

      if (
        this.notValid(contentDetail) ||
        contentDetail.applicationId !== params.applicationId ||
        contentDetail.type !== apiType
      ) {
        return Response.accessDeny(i18n.content.invalidContentId, 2162005);
      }

      const result = await this.service.content.live.setLiveVersion(params, {
        ctx,
        actionType: [LOG.LIVE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2162001);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionIsNotReleaseStatus, 2162002);
      } else if (result.code === 3) {
        const contentResult: any = JSON.parse(<string>result.data);
        if (contentResult.code === 3) {
          return Response.warning(
            i18n.content.RelationInfoNotExist + ':' + (contentResult.data || []).join(','),
            2162003,
          );
        } else if (contentResult.code === 4) {
          return Response.warning(i18n.content.RelationDependRecursive + ':' + contentResult.data, 2162004);
        }
      }

      await this.service.content.live.runTransaction(ctx.transactions);
      contentDetail = await this.service.content.live.getDetailById(params.id);

      return Response.success(contentDetail, 1162001);
    } catch (err) {
      return Response.error(err, i18n.content.setContentLiveFailed, 3162001);
    }
  }
}
