import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddResourceGroupDetailReq, FolderDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkResourceName, formatToPath, generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class AddAssetDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create static resource folder level details
   * @param  {AddTypeFolderDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('/folders')
  @OpenAPI({
    summary: i18n.sw.addResourceFolderDetail,
    description: '',
    tags: ['Resource'],
    operationId: 'add-resource-folder-detail',
  })
  @ResponseSchema(FolderDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddResourceGroupDetailReq): Promise<ResData<Folder>> {
    params.name = _.trim(params.name);

    // Check the validity of the name
    if (!params.name || !checkResourceName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2120301);
    }

    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4120301);
      }

      const folderDetail: Folder = Object.assign(_.omit(params, 'path'), {
        id: generationId(PRE.FOLDER),
        folderPath: params.path ? formatToPath(params.path) : formatToPath(params.name),
        creator: ctx.userInfo.id,
      });

      // Check if the folder is duplicate
      const checkParams = Object.assign(
        { deleted: false },
        _.pick(folderDetail, ['applicationId', 'parentFolderId']),
      );
      const [nameDetail, pathDetail] = await Promise.all([
        this.service.folder.info.getDetail(Object.assign({ name: folderDetail.name }, checkParams)),
        this.service.folder.info.getDetail(
          Object.assign({ folderPath: folderDetail.folderPath }, checkParams),
        ),
      ]);

      if (!this.notValid(nameDetail)) {
        return Response.warning(i18n.resource.nameExist, 2120302);
      }

      if (!this.notValid(pathDetail)) {
        return Response.warning(i18n.resource.pathExist, 2120303);
      }

      // Add resource folder
      this.service.folder.info.create(folderDetail, { ctx });

      await this.service.folder.info.runTransaction(ctx.transactions);
      const resourceDetail = await this.service.folder.info.getDetailById(folderDetail.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: folderDetail.id, type: TYPE.RESOURCE });

      return Response.success(resourceDetail, 1120301);
    } catch (err) {
      return Response.error(err, i18n.resource.addResourceFolderFailed, 3120301);
    }
  }
}
