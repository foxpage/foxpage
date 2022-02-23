import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  ContentVersionUpdateReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class UpdatePageVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update page content version information, including version number and content
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('/versions')
  @OpenAPI({
    summary: i18n.sw.updatePageVersionDetail,
    description: '/page/version/detail',
    tags: ['Page'],
    operationId: 'update-page-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionUpdateReq): Promise<ResData<ContentVersion>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.PAGE });
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051901);
      }

      const checkResult = this.service.version.check.structure(params.content || {});
      if (checkResult.code !== 0) {
        if (checkResult.code === 1) {
          return Response.warning(i18n.page.invalidPageContentId + ': ' + checkResult?.msg || '', 2051901);
        } else if (checkResult.code === 2) {
          return Response.warning(i18n.page.invalidRelationFormat + ': ' + checkResult?.msg || '', 2051902);
        } else if (checkResult.code === 3) {
          return Response.warning(i18n.page.invalidStructureNames + ': ' + checkResult?.msg || '', 2051903);
        }
      }

      const result: Record<string, any> = await this.service.version.info.updateVersionDetail(params, {
        ctx,
      });

      if (result.code !== 0) {
        if (result.code === 1) {
          return Response.warning(i18n.page.invalidVersionId, 2051904);
        } else if (result.code === 2) {
          return Response.warning(i18n.page.unEditedStatus, 2051905);
        } else if (result.code === 3) {
          return Response.warning(i18n.page.versionExist, 2051906);
        } else if (result.code === 4) {
          return Response.warning(i18n.page.missingFields + result.data.join(','), 2051907);
        }
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(<string>result.data);

      return Response.success(versionDetail, 1051901);
    } catch (err) {
      return Response.error(err, i18n.content.updatePageVersionFailed, 3051901);
    }
  }
}
