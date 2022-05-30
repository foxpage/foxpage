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

@JsonController('templates')
export class SetTemplateLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the template
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/live-versions')
  @OpenAPI({
    summary: i18n.sw.setTemplateContentLive,
    description: '',
    tags: ['Template'],
    operationId: 'set-template-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentLiveReq): Promise<ResData<Content>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEMPLATE });

      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4071301);
      }

      const result = await this.service.content.live.setLiveVersion(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2071301);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionIsNotReleaseStatus, 2071302);
      } else if (result.code === 3) {
        const contentResult: any = JSON.parse(<string>result.data);
        if (contentResult.code === 1) {
          return Response.warning(
            i18n.content.ComponentInfoNotExist + ':' + contentResult.data.join(','),
            2071303,
          );
        } else if (contentResult.code === 2) {
          return Response.warning(i18n.content.ComponentDependRecursive + ':' + contentResult.data, 2071304);
        } else if (contentResult.code === 3) {
          return Response.warning(
            i18n.content.RelationInfoNotExist + ':' + contentResult.data.join(','),
            2071305,
          );
        } else if (contentResult.code === 4) {
          return Response.warning(i18n.content.RelationDependRecursive + ':' + contentResult.data, 2071306);
        }
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      return Response.success(versionDetail, 1071301);
    } catch (err) {
      return Response.error(err, i18n.template.setTemplateContentLiveFailed, 3071301);
    }
  }
}
