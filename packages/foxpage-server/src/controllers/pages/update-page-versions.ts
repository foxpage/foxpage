import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import {
  ContentVersionDetailRes,
  ContentVersionUpdateReq,
} from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdatePageVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update page content version information, including version number and content
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('pages/versions')
  @Put('templates/versions')
  @Put('blocks/versions')
  @OpenAPI({
    summary: i18n.sw.updatePageVersionDetail,
    description: '/page/version/detail',
    tags: ['Page'],
    operationId: 'update-page-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionUpdateReq): Promise<ResData<ContentVersion>> {
    let versionId = '';
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      const hasAuth = await this.service.auth.content(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051901);
      }

      const checkResult = this.service.version.check.structure(params.content || {});
      if (checkResult.code === 1) {
        return Response.warning(i18n.page.invalidPageContentId, 2051901, checkResult.data);
      } else if (checkResult.code === 2) {
        return Response.warning(i18n.page.invalidRelationFormat, 2051902, checkResult.data);
      } else if (checkResult.code === 3) {
        return Response.warning(i18n.page.invalidStructureNames, 2051903, checkResult.data);
      }

      const mockId = params.content?.extension?.mockId || '';
      params.content = <any>_.omit(params.content || {}, ['extension']);
      let result: Record<string, any> = {};
      [result] = await Promise.all([
        this.service.version.info.updateVersionDetail(params, { ctx }),
        this.service.content.tag.updateExtensionTag(params.id, { mockId }, { ctx }),
      ]);

      if (result.code === 1) {
        return Response.warning(i18n.page.invalidVersionId, 2051904);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.unEditedStatus, 2051905);
      } else if (result.code === 3) {
        return Response.warning(i18n.page.versionExist, 2051906);
      } else if (result.code === 4) {
        return Response.warning(i18n.page.missingFields + ': ' + result.data.join(','), 2051907);
      } else if (result.code === 5) {
        return Response.warning(i18n.page.contentHadUpdatedBefore, 2051908);
      } else if (result.code === 0 && result.data) {
        versionId = result.data;
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const versionDetail = await this.service.version.info.getDetailById(<string>result.data);
      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>result.data, type: apiType });

      return Response.success(versionDetail, 1051901);
    } catch (err) {
      return Response.error(err, i18n.content.updatePageVersionFailed, 3051901);
    } finally {
      // save version relation
      if (versionId) {
        const versionRelationQuery = await this.service.relation.saveVersionRelations(versionId);
        await this.service.version.info.runTransaction([versionRelationQuery]);
      }
    }
  }
}
