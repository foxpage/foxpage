import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentVersionNumber, TemplateDetail } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, TemplateListReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('template')
export class GetTemplates extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get all live version template data under the specified application
   * @param  {ContentListReq} params
   * @returns {ContentInfo}
   */
  @Get('s')
  @OpenAPI({
    summary: i18n.sw.templateList,
    description: '',
    tags: ['Template'],
    operationId: 'template-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: TemplateListReq): Promise<ResData<TemplateDetail[]>> {
    try {
      let templateList: TemplateDetail[] = [];

      // 获取模板的FileIds
      const fileList = await this.service.file.list.getAppTypeFileList({
        applicationId: params.applicationId,
        type: TYPE.TEMPLATE,
      });
      const fileIds = _.map(fileList, 'id');

      let contentList: Content[] = [];
      if (fileIds.length > 0) {
        // Get contentId with live version
        contentList = await this.service.content.file.getContentByFileIds(fileIds);
      }

      // contentId, versionNumber
      let contentLiveNumbers: ContentVersionNumber[] = [];
      if (contentList.length > 0) {
        contentList.forEach((content) => {
          if (content.liveVersionNumber > 0 && !content.deleted) {
            contentLiveNumbers.push({
              contentId: content.id,
              versionNumber: content.liveVersionNumber,
            });
          }
        });
      }

      // Get the details of content
      let contentVersion: ContentVersion[] = [];
      if (contentLiveNumbers.length > 0) {
        contentVersion = await this.service.version.list.getContentByIdAndVersionNumber(contentLiveNumbers);
      }
      const contentObject: Record<string, Content> = _.keyBy(contentList, 'id');
      contentVersion.forEach((version) => {
        templateList.push({
          id: contentObject[version.contentId]?.id,
          title: contentObject[version.contentId]?.title,
          version: version,
        });
      });

      return Response.success(templateList, 1160701);
    } catch (err) {
      return Response.error(err, i18n.content.getTemplateListFailed, 3160701);
    }
  }
}
