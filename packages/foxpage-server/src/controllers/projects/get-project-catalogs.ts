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

      if (this.notValid(projectDetail)) {
        return Response.warning(i18n.project.invalidProjectId, 2040501);
      }

      const folderFiles = await this.service.folder.list.getAllChildrenRecursive({
        folderIds: [params.id],
        depth: 5,
        hasContent: true,
        fileTypes: [TYPE.TEMPLATE, TYPE.PAGE, TYPE.BLOCK],
      });

      if (folderFiles[params.id] && folderFiles[params.id].files.length > 0) {
        folderFiles[params.id].files.forEach((file) => {
          if (file.contents && file.contents.length > 0) {
            file.contents.forEach((content) => {
              content.isBase = _.remove(content.tags, (tag) => !_.isNil(tag.isBase))[0]?.isBase || false;
              content.extendId = _.remove(content.tags, (tag) => !_.isNil(tag.extendId))[0]?.extendId || '';
            });
          }
        });
      }

      return Response.success(
        Object.assign({}, _.pick(projectDetail, ['id', 'name']), folderFiles[params.id]),
        1040501,
      );
    } catch (err) {
      return Response.error(err, i18n.project.getProjectCatalogFailed, 3040501);
    }
  }
}
