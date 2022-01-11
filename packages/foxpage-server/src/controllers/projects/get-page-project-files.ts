import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FileFolderInfo } from '../../types/file-types';
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
      if (!folderDetail || (!params.deleted && folderDetail.deleted)) {
        return Response.warning(i18n.project.projectIsInvalidOrDeleted);
      }

      this.service.folder.list.setPageSize(params);

      const childrenList: {
        count: number;
        data: FileFolderInfo;
      } = await this.service.folder.list.getPageChildrenList(params, [TYPE.TEMPLATE, TYPE.PAGE]);

      return Response.success({
        pageInfo: {
          page: params.page,
          size: params.size,
          total: childrenList.count,
        },
        data: childrenList.data || [],
      });
    } catch (err) {
      return Response.error(err, i18n.project.getChildrenFilesFailed);
    }
  }
}
