import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import { UpdateResourceFolderReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { checkResourceName, formatToPath } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class UpdateResourceFolderDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update resource folder details, including name, path, intro, tags
   * @param  {ContentVersionDetailRes} params
   * @returns {ContentVersion}
   */
  @Put('/folders')
  @OpenAPI({
    summary: i18n.sw.updateResourceFolderDetail,
    description: '',
    tags: ['Resource'],
    operationId: 'update-resource-folder-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateResourceFolderReq): Promise<ResData<Folder>> {
    // Check the validity of the name
    if (params.name && !checkResourceName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2122101);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.RESOURCE });

      const hasAuth = await this.service.auth.folder(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4122101);
      }

      // Check that the folder is a resource folder, not a resource group or a parent folder of the resource group
      const folderObject = await this.service.folder.list.getAllParentsRecursive([params.id]);
      if (!folderObject[params.id] || folderObject[params.id].length < 3) {
        return Response.warning(i18n.resource.invalidResourceFolderId, 2122102);
      }

      // Check the effectiveness of resources
      let folderDetail = await this.service.folder.info.getDetailById(params.id);
      if (this.notValid(folderDetail) || folderDetail.applicationId !== params.applicationId) {
        return Response.warning(i18n.resource.invalidResourceFolderId, 2122103);
      }

      // Check the folder name and whether the path is duplicate
      const name = params.name || folderDetail.name;
      const folderPath = formatToPath(name);
      const duplicationFolder = await this.service.folder.info.getDetail({
        parentFolderId: folderDetail.parentFolderId,
        id: { $ne: params.id },
        $or: [{ name }, { folderPath }],
        deleted: false,
      });
      if (duplicationFolder) {
        return Response.warning(i18n.resource.nameOrPathExist, 2122104);
      }

      this.service.folder.info.updateContentItem(
        params.id,
        { name: params.name, intro: params.intro || folderDetail.intro, folderPath },
        { ctx },
      );

      await this.service.folder.info.runTransaction(ctx.transactions);
      folderDetail = await this.service.folder.info.getDetailById(params.id);

      return Response.success(folderDetail, 1122101);
    } catch (err) {
      return Response.error(err, i18n.resource.updateResourceFolderDetailFailed, 3122101);
    }
  }
}
