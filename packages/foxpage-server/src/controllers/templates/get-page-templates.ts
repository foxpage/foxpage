import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, ContentVersion, File, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ContentInfo } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypePageListCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('template-searchs')
export class GetPageTemplateList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the paged template list information under the file
   * @param  {AppTypePageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPageTemplates,
    description: '',
    tags: ['Template'],
    operationId: 'get-page-template-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypePageListCommonReq): Promise<ResData<ContentInfo[]>> {
    try {
      // TODO search parameter not implemented
      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (this.notValid(folderDetail) || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2070401);
        }
      } else {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.PROJECT as AppFolderTypes,
        });
      }

      this.service.file.info.setPageSize(params);
      const fileList = await this.service.file.list.getFileListByFolderId(params.folderId, {
        type: TYPE.TEMPLATE as FileTypes,
      });

      let fileVersion: any = [];
      const pageFileList = _.chunk(fileList, params.size)[params.page - 1] || [];
      if (pageFileList.length > 0) {
        // Get the live details of the content of the file
        const contentList = await this.service.content.file.getContentByFileIds(_.map(pageFileList, 'id'));
        const versionList = await this.service.version.number.getContentByIdNumber(
          _.map(contentList, (content) => {
            return { contentId: content.id, versionNumber: content.liveVersionNumber };
          }),
        );
        const fileObject: Record<string, File> = _.keyBy(pageFileList, 'id');
        const versionObject: Record<string, ContentVersion> = _.keyBy(versionList, 'contentId');

        contentList.forEach((content) => {
          fileVersion.push({
            id: fileObject?.[content.fileId].id,
            name: fileObject?.[content.fileId].name,
            type: fileObject?.[content.fileId].type,
            version: content.liveVersionNumber || versionObject?.[content.id]?.versionNumber,
            contentId: content.id,
            content: versionObject?.[content.id]?.content || {},
          });
        });
      }

      return Response.success(
        {
          pageInfo: {
            total: fileList.length,
            page: params.page,
            size: params.size,
          },
          data: fileVersion,
        },
        1070401,
      );
    } catch (err) {
      return Response.error(err, i18n.template.getPageTemplateFailed, 3070401);
    }
  }
}
