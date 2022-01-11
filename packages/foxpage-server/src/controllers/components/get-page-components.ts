import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TAG, TYPE } from '../../../config/constant';
import { FileUserInfo } from '../../types/file-types';
import { PageData, ResData } from '../../types/index-types';
import { AppComponentListReq } from '../../types/validates/component-validate-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface FileContentUserInfo extends FileUserInfo {
  contentId: string;
  online?: boolean;
}

@JsonController('component-searchs')
export class GetPageComponentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the paging list of components under the application
   * @param  {AppPageListCommonReq} params
   * @returns {FileUserInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getPageComponentsList,
    description: '',
    tags: ['Component'],
    operationId: 'get-page-component-list',
  })
  @ResponseSchema(FileListRes)
  async index(@QueryParams() params: AppComponentListReq): Promise<ResData<PageData<FileContentUserInfo>>> {
    try {
      this.service.folder.info.setPageSize(params);

      // Get the root folder id of the component
      const appComponentFolderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.COMPONENT as AppFolderTypes,
      });

      if (!appComponentFolderId) {
        return Response.warning(i18n.component.invalidFolderType);
      }

      const fileParams = {
        applicationId: params.applicationId,
        folderId: appComponentFolderId,
        type: params.type,
        search: params.search,
        sort: { createTime: -1 },
        from: (params.page - 1) * params.size,
        to: params.page * params.size,
      };
      const fileList = await this.service.file.list.getPageData(fileParams);

      // Get normal and referenced file ids
      let fileIds: string[] = [];
      let referenceIds: string[] = [];
      _.map(fileList.list, (file) => {
        if (file.tags && file.tags[0]?.type === TAG.DELIVERY_REFERENCE) {
          referenceIds.push(file.tags[0].reference.id);
        } else {
          fileIds.push(file.id);
        }
      });

      const [contentList, referenceList, onlineList] = await Promise.all([
        this.service.content.file.getContentByFileIds(fileIds),
        this.service.content.file.getContentByFileIds(referenceIds),
        this.service.store.goods.find({ 'details.id': { $in: fileIds }, status: 1, deleted: false }),
      ]);
      const contentObject = _.keyBy(contentList, 'fileId');
      const referenceObject = _.keyBy(referenceList, 'fileId');
      const fileOnlineObject: Record<string, any> = _.keyBy(_.map(onlineList, 'details'), 'id');

      let fileContentList: FileContentUserInfo[] = [];
      fileList.list.forEach((file) => {
        fileContentList.push(
          Object.assign(
            { online: !!fileOnlineObject[file.id] },
            {
              contentId:
                contentObject[file.id]?.id || referenceObject[file?.tags?.[0].reference?.id]?.id || '',
            },
            file,
          ),
        );
      });

      return Response.success({
        data: fileContentList,
        pageInfo: {
          page: params.page,
          size: params.size,
          total: fileList.count,
        },
      });
    } catch (err) {
      return Response.error(err, i18n.component.getPagePagesFailed);
    }
  }
}
