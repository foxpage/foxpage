import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ComponentDSL, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE, VERSION } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ComponentVersionUpdateReq } from '../../types/validates/component-validate-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class UpdateComponentVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update component version information,
   * the release version content only can update editor data
   * @param  {ContentVersionUpdateReq} params
   * @returns {ContentVersion}
   */
  @Put('/versions')
  @OpenAPI({
    summary: i18n.sw.updateComponentVersionDetail,
    description: '/component/version/detail',
    tags: ['Component'],
    operationId: 'update-component-version-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: ComponentVersionUpdateReq,
  ): Promise<ResData<ContentVersion>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.version(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4111901);
      }

      // Check the validity of the version ID
      const versionDetail = await this.service.version.info.getDetailById(params.id);
      if (this.notValid(versionDetail)) {
        return Response.warning(i18n.content.invalidVersionId, 2111901);
      }

      const contentDetail = await this.service.content.info.getDetailById(versionDetail.contentId);

      // Only under base status need to check
      let versionContent = params.content as ComponentDSL;
      if (versionDetail.status === VERSION.STATUS_BASE) {
        // Check content required fields
        !_.isPlainObject(params.content) && (params.content = <any>{});
        params.content.id = versionDetail.contentId;
        // Check the required fields of content
        const missingFields = await this.service.version.check.contentFields(
          contentDetail.fileId,
          params.content,
        );

        if (missingFields.length > 0) {
          return Response.warning(i18n.content.contentMissFields + ':' + missingFields.join(','), 2111902);
        }

        // Check the validity of the version
        if (params.version && params.version !== versionDetail.version) {
          const newVersionDetail = await this.service.version.info.getDetail({
            contentId: versionDetail.id,
            version: params.version,
            deleted: false,
          });
          if (this.notValid(newVersionDetail) && newVersionDetail.id !== versionDetail.id) {
            return Response.warning(i18n.component.versionExist, 2111903);
          }
        }
      } else {
        // Add meta update log if component meta updated
        if (params.content?.meta !== versionDetail.content?.meta) {
          ctx.operations.push(
            ...this.service.log.addLogItem(LOG.META_UPDATE, versionDetail, { fileId: contentDetail.fileId }),
          );
        }

        !versionDetail.content.resource && (versionDetail.content.resource = {});

        versionDetail.content.id = versionDetail.content.id;
        versionDetail.content.resource['editor-entry'] = params.content?.resource?.['editor-entry'] || [];
        versionDetail.content.meta = params.content?.meta || {};
      }

      // Save new version information
      const result = await this.service.component.updateVersionDetail(
        {
          applicationId: params.applicationId,
          id: params.id,
          content: versionContent,
          version: params.version || versionDetail.version,
        },
        { ctx, actionDataType: contentDetail.type },
      );

      if (result.code === 1) {
        return Response.warning(i18n.component.missingFields + (<string[]>result?.data).join(','), 2111904);
      }

      await this.service.version.info.runTransaction(ctx.transactions);
      const newVersionDetail = await this.service.version.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(newVersionDetail, 1111901);
    } catch (err) {
      return Response.error(err, i18n.component.updateComponentVersionFailed, 3111901);
    }
  }
}
