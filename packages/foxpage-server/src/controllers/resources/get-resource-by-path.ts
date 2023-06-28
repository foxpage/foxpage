import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content, ContentVersion, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import {
  FileFolderChildren,
  FileFolderContentChildren,
  FolderChildren,
  // NewResourceDetail,
  // ResourceFolderChildren,
  ResourceFolderContentChildren,
} from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileListRes } from '../../types/validates/file-validate-types';
import { ResourcePathDetailReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class GetResourceDetailByPath extends BaseController {
  constructor() {
    super();
  }

  /**
   * Obtain the specified resource details through the path
   * @param  {FileListReq} params
   * @returns {FileFolderInfo}
   */
  @Get('/by-paths')
  @OpenAPI({
    summary: i18n.sw.getResourceDetailByPath,
    description: '',
    tags: ['Resource'],
    operationId: 'get-resource-detail-by-path',
  })
  @ResponseSchema(FileListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: ResourcePathDetailReq,
  ): Promise<ResData<FolderChildren>> {
    const depth: number = params.depth && params.depth > 0 && params.depth < 6 ? params.depth : 5;

    try {
      const originPathList = params.path.split('/');
      const pathList: string[] = _.clone(originPathList);
      const typeId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.RESOURCE as AppFolderTypes,
      });

      const folderId = await this.service.folder.info.getFolderIdByPathRecursive(
        {
          applicationId: params.applicationId,
          parentFolderId: typeId,
          pathList,
        },
        { ctx },
      );

      let resourceDetail: Partial<FolderChildren> = {};
      if (folderId) {
        const folderDetail: Folder = await this.service.folder.info.getDetailById(folderId);
        // Get all the sub-file information of the resource file
        const resourceChildren = await this.service.folder.list.getAllChildrenRecursive({
          folderIds: [folderId],
          depth,
        });
        resourceDetail = Object.assign({}, folderDetail, { children: resourceChildren[folderId] || {} });

        const fileIds = this.service.file.info.getFileIdFromResourceRecursive(
          resourceDetail.children as FileFolderChildren,
        );

        // TODO (To be optimized) Get the content of the file and put it under the file details
        const contentList = await this.service.content.file.getContentByFileIds(fileIds);
        const versionList = await this.service.version.info.find({
          contentId: { $in: _.map(contentList, 'id') },
          deleted: false,
        });

        // Compatible with the prefix '/' of realPath in file
        const contentObject: Record<string, Content> = _.keyBy(contentList, 'fileId');
        const versionObject: Record<string, ContentVersion> = {};
        versionList.forEach((version) => {
          if (version.content?.realPath) {
            version.content.realPath = '/' + _.pull(version.content.realPath.split('/'), '').join('/');
          }
          versionObject[version.contentId] = version;
        });

        resourceDetail.children = this.service.file.info.addContentToFileRecursive(
          resourceDetail.children as FileFolderContentChildren,
          contentObject,
          versionObject,
        ) as ResourceFolderContentChildren;

        // Get resource latest versions
        // if (originPathList.length === 1) {
        //   const resourceLatestVersion = await this.service.resource.getResourceGroupLatestVersion(folderId);
        //   (<ResourceFolderContentChildren>resourceDetail.children).newResources = <NewResourceDetail[]>(
        //     _.remove(resourceLatestVersion, { id: undefined })
        //   );
        //   const resourceLatestVersionObject = _.keyBy(resourceLatestVersion, 'id');
        //   resourceDetail.children?.folders?.forEach((folder) => {
        //     if (resourceLatestVersionObject[folder.id]) {
        //       (<ResourceFolderChildren>folder).newVersion = resourceLatestVersionObject[folder.id];
        //     }
        //   });
        // }
      }

      return Response.success(resourceDetail, 1121001);
    } catch (err) {
      return Response.error(err, i18n.resource.getResourceDetailFailed, 3121001);
    }
  }
}
