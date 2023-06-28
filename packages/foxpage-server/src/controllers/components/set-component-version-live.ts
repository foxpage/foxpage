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

@JsonController('components')
export class SetComponentLiveVersions extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the live version of the component
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/live-versions')
  @OpenAPI({
    summary: i18n.sw.setComponentContentLive,
    description: '',
    tags: ['Component'],
    operationId: 'set-component-live-versions',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentLiveReq): Promise<ResData<Content>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111501);
      }

      const contentDetail = await this.service.content.info.getDetailById(params.id);

      // set component live and update reference component's application status
      const [result] = await Promise.all([
        this.service.content.live.setLiveVersion(params, { ctx }),
        this.service.component.updateReferLiveVersion(contentDetail.id, contentDetail.fileId, { ctx }),
      ]);

      if (result.code === 1) {
        return Response.warning(i18n.content.invalidVersionId, 2111501);
      } else if (result.code === 2) {
        return Response.warning(i18n.content.versionIsNotReleaseStatus, 2111502);
      } else if (result.code === 3) {
        const contentResult: Record<string, any> = JSON.parse(<string>result.data);
        if (contentResult.code === 1) {
          return Response.warning(
            i18n.content.ComponentInfoNotExist + ':' + contentResult.data.join(','),
            2111503,
          );
        } else if (contentResult.code === 2) {
          return Response.warning(i18n.content.ComponentDependRecursive + ':' + contentResult.data, 2111504);
        }
      }

      await this.service.version.live.runTransaction(ctx.transactions);
      const versionDetail = await this.service.content.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(versionDetail, 1111501);
    } catch (err) {
      return Response.error(err, i18n.component.setComponentContentLiveFailed, 3111501);
    }
  }
}
