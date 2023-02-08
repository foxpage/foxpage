import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content, ContentVersion, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, TYPE } from '../../../config/constant';
import { ContentInfo, FileContentAndVersion } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { AppContentListRes, AppTypePageListCommonReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('mock-searchs')
export class GetPageMockList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the information of the paging mock list under the file
   * if folderId is valid and type = all, return mock in special project and app
   * @param  {AppPageListCommonReq} params
   * @returns {ContentInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppPageMocks,
    description: '',
    tags: ['Mock'],
    operationId: 'get-page-mock-list',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: AppTypePageListCommonReq): Promise<ResData<ContentInfo[]>> {
    try {
      let fileListPromise = [];
      let appFolderId = '';
      this.service.folder.info.setPageSize(params);

      if (params.folderId) {
        const folderDetail = await this.service.folder.info.getDetailById(params.folderId);
        if (this.notValid(folderDetail) || folderDetail.applicationId !== params.applicationId) {
          return Response.warning(i18n.folder.invalidFolderId, 2190301);
        }

        fileListPromise.push(
          this.service.file.list.getFileListByFolderId(params.folderId, { type: TYPE.MOCK as FileTypes }),
        );
      }

      if (params.type !== TYPE.PROJECT) {
        appFolderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.MOCK as AppFolderTypes,
        });

        fileListPromise.push(
          this.service.file.list.getFileListByFolderId(appFolderId, { type: TYPE.MOCK as FileTypes }),
        );
      }

      const fileList = _.flatten(await Promise.all(fileListPromise));

      let fileVersion: FileContentAndVersion[] = [];
      const pageFileList = _.chunk(fileList, params.size)[params.page - 1] || [];

      if (pageFileList.length > 0) {
        const appFileList = _.remove(pageFileList, (file) => file.folderId === appFolderId);

        // Get the live details of the content of the file
        let appContentList: Content[] = [];
        let appVersionObject: Record<string, ContentVersion> = {};
        let appVersionItemRelation: Record<string, any[]> = {};
        if (appFileList.length > 0) {
          appContentList = await this.service.content.file.getContentByFileIds(_.map(pageFileList, 'id'));
          appVersionObject = await this.service.version.list.getContentMaxVersionDetail(
            _.map(appContentList, 'id'),
          );
          appVersionItemRelation = await this.service.version.list.getVersionListRelations(
            _.toArray(appVersionObject),
          );
        }

        let contentList: Content[] = [];
        let versionObject: Record<string, ContentVersion> = {};
        let versionItemRelation: Record<string, any[]> = {};
        if (pageFileList.length > 0) {
          contentList = await this.service.content.file.getContentByFileIds(_.map(pageFileList, 'id'));
          versionObject = await this.service.version.list.getContentMaxVersionDetail(
            _.map(contentList, 'id'),
          );
          versionItemRelation = await this.service.version.list.getVersionListRelations(
            _.toArray(versionObject),
            false,
          );
        }

        // Splicing combination returns data
        const fileObject = _.keyBy(appFileList.concat(pageFileList), 'id');
        const allVersionItemRelations = _.merge(appVersionItemRelation, versionItemRelation);
        const allVersionObject = _.merge(appVersionObject, versionObject);
        for (const content of appContentList.concat(contentList)) {
          const itemRelations = await this.service.relation.formatRelationDetailResponse(
            allVersionItemRelations[content.id],
          );

          const contentVersion = allVersionObject?.[content.id]?.content || {};
          // format mock props value
          contentVersion.schemas = this.service.version.info.formatMockValue(
            contentVersion?.schemas,
            ACTION.GET,
          );

          fileVersion.push({
            id: fileObject?.[content.fileId]?.id,
            name: fileObject?.[content.fileId]?.name,
            type: fileObject?.[content.fileId]?.type,
            version: allVersionObject?.[content.id]?.version || '',
            versionNumber: content.liveVersionNumber || allVersionObject?.[content.id]?.versionNumber,
            contentId: content.id,
            content: contentVersion,
            relations: itemRelations,
          });
        }
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
        1190301,
      );
    } catch (err) {
      return Response.error(err, i18n.mock.getPageMockFailed, 3190301);
    }
  }
}
