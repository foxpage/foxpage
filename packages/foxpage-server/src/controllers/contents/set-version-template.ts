import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

// import { AppFolderTypes, ContentVersion, File, FileTypes } from '@foxpage/foxpage-server-types';
import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
// import { ContentInfo } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { SetVersionTemplateReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('content')
export class SetVersionTemplate extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the content's version template relation
   * @param  {SetVersionTemplateReq} params
   * @returns {ContentInfo}
   */
  @Put('/version/template')
  @OpenAPI({
    summary: i18n.sw.getAppPageTemplates,
    description: '',
    tags: ['Content'],
    operationId: 'get-page-template-list',
  })
  // @ResponseSchema()
  async index(@Ctx() ctx: FoxCtx, @Body() params: SetVersionTemplateReq): Promise<ResData<string>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.version(params.versionId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4070101);
      }

      // get the template content and file info
      const contentDetail = await this.service.content.info.getDetailById(params.templateId);
      if (this.notValid(contentDetail)) {
        return Response.warning(i18n.content.invalidTemplateId, 2070101);
      }
      const [fileDetail, versionDetail] = await Promise.all([
        this.service.file.info.getDetailById(contentDetail.fileId),
        this.service.version.info.getDetailById(params.versionId),
      ]);
      if (this.notValid(fileDetail)) {
        return Response.warning(i18n.content.invalidTemplateId, 2070102);
      }

      if (fileDetail.applicationId !== params.applicationId) {
        return Response.warning(i18n.content.invalidTemplateId, 2070103);
      }

      // update version template
      const versionData = versionDetail.content || {};
      const newTemplateRelationKey = '__templates:' + params.templateId + ':schemas';
      if (versionData.schemas[0]?.directive?.tpl) {
        versionData.schemas[0].directive.tpl = '{{' + newTemplateRelationKey + '}}';
      }
      versionData.relation[newTemplateRelationKey] = { id: params.templateId, type: TYPE.TEMPLATE };
      for (const relation in versionData.relation) {
        if (
          _.startsWith(relation, '__templates:') &&
          versionData.relation[relation]?.id !== params.templateId
        ) {
          versionData.relation[relation] = undefined;
        }
      }

      await this.service.version.info.updateDetail(params.versionId, { content: versionData });

      return Response.success(i18n.content.updateVersionTemplateSuccess, 1070101);
    } catch (err) {
      return Response.error(err, i18n.content.updateVersionTemplateFailed, 3070101);
    }
  }
}
