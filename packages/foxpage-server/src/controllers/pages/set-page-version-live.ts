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
export class SetPageLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the page, template and block
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('pages/live-versions')
  @Put('templates/live-versions')
  @Put('blocks/live-versions')
  @OpenAPI({
    summary: i18n.sw.setPageContentLive,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentLiveReq): Promise<ResData<Content>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051401);
      }

      const result: Record<string, number | string> = await this.service.content.live.setLiveVersion(params, {
        ctx,
        actionType: [LOG.LIVE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2051401);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionIsNotReleaseStatus, 2051402);
      } else if (result.code === 3) {
        const contentResult: any = JSON.parse(<string>result.data);
        if (contentResult.code === 1) {
          return Response.warning(
            i18n.content.ComponentInfoNotExist + ':' + contentResult.data.join(','),
            2051403,
          );
        } else if (contentResult.code === 2) {
          return Response.warning(i18n.content.ComponentDependRecursive + ':' + contentResult.data, 2051404);
        } else if (contentResult.code === 3) {
          return Response.warning(
            i18n.content.RelationInfoNotExist + ':' + contentResult.data.join(','),
            2051405,
          );
        } else if (contentResult.code === 4) {
          return Response.warning(i18n.content.RelationDependRecursive + ':' + contentResult.data, 2051406);
        }
      } else if (result.code === 4) {
        return Response.warning(i18n.content.invalidVersionContent, 2051407);
      }

      await this.service.content.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.content.info.getDetailById(params.id);

      return Response.success(versionDetail, 1051401);
    } catch (err) {
      return Response.error(err, i18n.page.setPageContentLiveFailed, 3051401);
    }
  }
}
