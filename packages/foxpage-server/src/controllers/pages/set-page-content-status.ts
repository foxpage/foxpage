import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetPageContentStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set page, template, block content deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('pages/content-status')
  @Put('templates/content-status')
  @Put('blocks/content-status')
  @OpenAPI({
    summary: i18n.sw.setPageContentStatus,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-content-status',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Content>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: apiType });

      let [hasAuth, contentDetail] = await Promise.all([
        this.service.auth.content(params.id, { ctx }),
        this.service.content.info.getDetailById(params.id),
      ]);

      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.content.invalidContentId, 2051101);
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051101);
      }

      // check delete status
      if (contentDetail.liveVersionId) {
        return Response.warning(i18n.content.contentHasLiveVersion, 2051102);
      }

      const result = await this.service.content.info.setContentDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, apiType].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.content.invalidContentId, 2051103);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.contentCannotBeDeleted, 2051104);
      }

      await this.service.content.info.runTransaction(ctx.transactions);
      contentDetail = await this.service.content.info.getDetailById(params.id);

      this.service.relation.removeVersionRelations({ contentIds: [params.id] });

      return Response.success(contentDetail, 1051101);
    } catch (err) {
      return Response.error(err, i18n.page.setPageContentDeletedFailed, 3051101);
    }
  }
}
