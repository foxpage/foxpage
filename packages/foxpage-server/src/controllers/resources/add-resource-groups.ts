import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TAG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddTypeFolderDetailReq, FolderDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName, formatToPath, generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class AddResourceGroupDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Add a static resource group,
   * tags pass [{resourceType: 1|2, resourceId:'',type:'resourceGroup'}] to indicate
   * that the resource group is of type UNPKG
   * @param  {AddTypeFolderDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('/groups')
  @OpenAPI({
    summary: i18n.sw.addResourceGroupDetail,
    description: '/resource/folders',
    tags: ['Resource'],
    operationId: 'add-resource-group-detail',
  })
  @ResponseSchema(FolderDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddTypeFolderDetailReq): Promise<ResData<Folder>> {
    params.name = _.trim(params.name);

    // Check the validity of the name
    if (!params.name || !checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2120401);
    }

    try {
      // Check permission
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4120401);
      }

      if (!params.tags || params.tags.length === 0 || !_.find(params.tags, { type: TAG.RESOURCE_GROUP })) {
        return Response.warning(i18n.resource.invalidResourceGroupId, 2120404);
      }

      // Add resource group config to tags
      if (params.config && !_.isEmpty(params.config)) {
        params.tags.push(Object.assign(params.config, { type: TAG.RESOURCE_CONFIG }));
      }

      const folderDetail: Partial<Folder> = Object.assign(_.omit(params, ['path', 'parentFolderId']), {
        id: generationId(PRE.FOLDER),
        parentFolderId: '',
        folderPath: params.path ? formatToPath(params.path) : formatToPath(params.name),
      });

      // Add resource group folder
      const resourceTag = _.find(params.tags, 'resourceId') as Record<string, any>;
      const result = await this.service.folder.info.addTypeFolderDetail(folderDetail, {
        ctx,
        type: TYPE.RESOURCE as AppFolderTypes,
        actionDataType: TYPE.RESOURCE,
        distinctParams: {
          'tags.type': TAG.RESOURCE_CONFIG,
          'tags.resourceId': resourceTag.resourceId,
          name: folderDetail.name,
        },
      });

      if (result.code === 1) {
        return Response.warning(i18n.resource.invalidType, 2120402);
      }

      if (result.code === 2) {
        return Response.warning(i18n.resource.nameExist, 2120403);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);
      const projectDetail = await this.service.folder.info.getDetailById(<string>folderDetail.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>folderDetail.id, type: TYPE.RESOURCE });

      return Response.success(projectDetail, 1120401);
    } catch (err) {
      return Response.error(err, i18n.resource.addResourceGroupFailed, 3120401);
    }
  }
}
