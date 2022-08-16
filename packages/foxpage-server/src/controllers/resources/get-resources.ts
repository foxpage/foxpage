import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FileFolderChildren, FolderChildren } from '../../types/file-types';
import { ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { ResourceDetailReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetResourceDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the details of the specified resource
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getResourceDetail,
    description: '',
    tags: ['Resource'],
    operationId: 'get-resource-detail',
  })
  @ResponseSchema(FileListRes)
  async index(@QueryParams() params: ResourceDetailReq): Promise<ResData<FolderChildren>> {
    try {
      const { id = '', name = '' } = params;
      let folderDetail: Folder;

      // Check id, name and get file details
      if (!id && !name) {
        return Response.warning(i18n.resource.idOrNameMustExistOne, 2121401);
      } else if (id) {
        folderDetail = await this.service.folder.info.getDetail({
          applicationId: params.applicationId,
          id: params.id,
        });
      } else {
        // Get application resource folder Id
        const appTypeFolderIds = await this.service.folder.info.getAppDefaultFolderIds({
          applicationIds: [params.applicationId],
          type: TYPE.RESOURCE as AppFolderTypes,
        });

        if (appTypeFolderIds.size === 0) {
          return Response.warning(i18n.resource.missingResourceFolder, 2121402);
        }

        const resourceFolderList = await this.service.folder.info.find(
          {
            applicationId: params.applicationId,
            parentFolderId: [...appTypeFolderIds][0],
            name: params.name,
          },
          '-_id -tags._id',
        );

        if (resourceFolderList.length === 0) {
          return Response.success({});
        }
        folderDetail = resourceFolderList[0];
      }
      params.id = folderDetail?.id || '';

      let resourceDetail: Partial<FolderChildren> = {};
      if (params.id) {
        // Get all the sub-file information of the resource file
        let resourceChildren: Record<string, FileFolderChildren> = {};
        let folderParentList: Record<string, Folder[]> = {};
        [resourceChildren, folderParentList] = await Promise.all([
          this.service.folder.list.getAllChildrenRecursive({ folderIds: [params.id], depth: 5 }),
          this.service.folder.list.getAllParentsRecursive([params.id]),
        ]);

        resourceDetail = Object.assign({}, folderDetail, {
          depth: folderParentList[params.id] ? folderParentList[params.id].length - 1 : 0,
          children: resourceChildren[params.id] || [],
        });
      }

      return Response.success(resourceDetail, 1121401);
    } catch (err) {
      return Response.error(err, i18n.resource.getResourceDetailFailed, 3121401);
    }
  }
}
