import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentVersionDetailRes, ContentVersionReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('components')
export class AddComponentVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create component version information
   * @param  {ContentVersionReq} params
   * @param  {Header} headers
   * @returns {ContentVersion}
   */
  @Post('/versions')
  @OpenAPI({
    summary: i18n.sw.addComponentVersionDetail,
    description: '',
    tags: ['Component'],
    operationId: 'add-component-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: ContentVersionReq): Promise<ResData<ContentVersion>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.content(params.contentId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4110101);
      }

      // Get versionNumber from version
      const versionNumber = this.service.version.number.createNumberFromVersion(params.version);
      if (!versionNumber) {
        return Response.warning(i18n.content.invalidVersion + ': "' + params.version + '"', 2110101);
      }

      // Check the validity of contents and versions
      let contentDetail: Content;
      let isNewVersion: boolean = false;
      [contentDetail, isNewVersion] = await Promise.all([
        this.service.content.info.getDetailById(params.contentId),
        this.service.version.check.isNewVersion(params.contentId, versionNumber),
      ]);

      if (this.notValid(contentDetail) || !isNewVersion) {
        return Response.warning(i18n.content.invalidContentIdOrVersionExist, 2110102);
      }

      !_.isPlainObject(params.content) && (params.content = {});

      // Check the required fields of content
      const missingFields = await this.service.version.check.contentFields(
        contentDetail.fileId,
        params.content,
      );

      if (missingFields.length > 0) {
        return Response.warning(i18n.content.contentMissFields + ':' + missingFields.join(','), 2110103);
      }

      params.content.id = params.contentId;

      // Save new version info
      const newVersionDetail: Partial<ContentVersion> = {
        id: generationId(PRE.CONTENT_VERSION),
        contentId: params.contentId,
        version: params.version,
        versionNumber: versionNumber,
        content: params.content,
      };
      this.service.version.info.create(newVersionDetail, {
        ctx,
        actionDataType: TYPE.COMPONENT,
      });

      await this.service.version.info.runTransaction(ctx.transactions);

      const versionDetail = await this.service.version.info.getDetailById(<string>newVersionDetail.id);
      ctx.logAttr = Object.assign(ctx.logAttr, { id: newVersionDetail.id, type: TYPE.COMPONENT });

      return Response.success(versionDetail, 1110101);
    } catch (err) {
      return Response.error(err, i18n.content.addContentVersionFailed, 3110101);
    }
  }
}
