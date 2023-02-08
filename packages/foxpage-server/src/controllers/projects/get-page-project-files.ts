import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FileFolderInfo, FileInfo } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { FileFolderListRes, FileListReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class GetProjectFileList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the list of paging files under the project
   * @param  {ProjectListReq} params
   * @param  {Header} headers
   * @returns {FileFolderInfo}
   */
  @Get('/files')
  @OpenAPI({
    summary: i18n.sw.getPageProjectFiles,
    description: '',
    tags: ['Project'],
    operationId: 'get-page-project-files',
  })
  @ResponseSchema(FileFolderListRes)
  async index(@QueryParams() params: FileListReq): Promise<ResData<FileFolderInfo>> {
    try {
      // Check if the folder is deleted
      const folderDetail = await this.service.folder.info.getDetailById(params.id);
      if (this.notValid(folderDetail) || (!params.deleted && folderDetail.deleted)) {
        return Response.warning(i18n.project.projectIsInvalidOrDeleted, 2040301);
      }

      this.service.folder.list.setPageSize(params);

      const [appDetail, filePageData] = await Promise.all([
        this.service.application.getDetailById(params.applicationId),
        this.service.file.list.getPageData({
          applicationId: params.applicationId,
          folderId: params.id,
          type: [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK].join(','),
          search: params.search || '',
          from: (params.page - 1) * params.size,
          to: params.page * params.size,
        }),
      ]);

      const fileIds = _.map(filePageData.list || [], 'id');
      const fileContents = await this.service.content.list.find({ fileId: { $in: fileIds }, deleted: false });
      let fileContentList: Record<string, Content[]> = {};
      fileContents.forEach((content) => {
        if (!fileContentList[content.fileId]) {
          fileContentList[content.fileId] = [];
        }
        fileContentList[content.fileId].push(content);
      });

      let fileFolderInfo: FileFolderInfo = { folders: [], files: [] };

      (filePageData.list || []).forEach((file) => {
        fileFolderInfo.files.push(
          Object.assign({}, _.omit(file, ['applicationId']), {
            application: { id: params.applicationId, name: appDetail.name || '' },
            hasContent: _.has(fileContentList, file.id),
            hasLiveContent:
              _.filter(fileContentList[file.id] || [], (content) => content.liveVersionNumber > 0).length > 0,
          }) as FileInfo,
        );
      });

      return Response.success(
        {
          pageInfo: this.paging(filePageData.count, params),
          data: fileFolderInfo,
        },
        1040301,
      );
    } catch (err) {
      return Response.error(err, i18n.project.getChildrenFilesFailed, 3040301);
    }
  }
}
