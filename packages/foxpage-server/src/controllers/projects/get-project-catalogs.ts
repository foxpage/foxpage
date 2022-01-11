import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { FileListReq, FolderAndFileDetail } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class GetProjectCatalog extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the file directory under the specified project
   * @param  {FolderDetailReq} params
   * @param  {Header} headers
   * @returns {Folder}
   */
  @Get('/catalogs')
  @OpenAPI({
    summary: i18n.sw.getProjectCatalog,
    description: '',
    tags: ['Project'],
    operationId: 'get-project-catalog',
  })
  @ResponseSchema(FolderAndFileDetail)
  async index(@QueryParams() params: FileListReq): Promise<ResData<Folder>> {
    try {
      // Get project information
      const projectDetail = await this.service.folder.info.getDetail(_.pick(params, ['id', 'applicationId']));

      if (!projectDetail) {
        return Response.warning(i18n.project.invalidProjectId);
      }

      const folderFiles = await this.service.folder.list.getAllChildrenRecursive({
        folderIds: [params.id],
        depth: 5,
        hasContent: true,
        fileTypes: [TYPE.TEMPLATE, TYPE.PAGE],
      });

      return Response.success(folderFiles[params.id]);
    } catch (err) {
      return Response.error(err, i18n.project.getProjectCatalogFailed);
    }
  }
}
