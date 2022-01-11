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

@JsonController('templates')
export class UpdateTemplateVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update template content version information, including version number and content
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('/versions')
  @OpenAPI({
    summary: i18n.sw.updateTemplateVersionDetail,
    description: '/template/version/detail',
    tags: ['Template'],
    operationId: 'update-template-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionUpdateReq): Promise<ResData<ContentVersion>> {
    try {
      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      const checkResult = this.service.version.check.structure(params.content || {});
      if (checkResult.code !== 0) {
        if (checkResult.code === 1) {
          return Response.warning(i18n.page.invalidPageContentId + ':' + checkResult?.msg || '');
        } else if (checkResult.code === 2) {
          return Response.warning(i18n.page.invalidRelationFormat + ':' + checkResult?.msg || '');
        } else if (checkResult.code === 3) {
          return Response.warning(i18n.page.invalidStructureNames + ':' + checkResult?.msg || '');
        }
      }

      const result = await this.service.version.info.updateVersionDetail(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.template.invalidVersionId);
      } else if (result.code === 2) {
        return Response.warning(i18n.template.unEditedStatus);
      } else if (result.code === 3) {
        return Response.warning(i18n.template.versionExist);
      } else if (result.code === 4) {
        return Response.warning(i18n.template.missingFields + (<string[]>result.data).join(','));
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>result.data, type: TYPE.TEMPLATE });

      return Response.success(versionDetail || {});
    } catch (err) {
      return Response.error(err, i18n.template.updateTemplateVersionFailed);
    }
  }
}
