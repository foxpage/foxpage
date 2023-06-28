import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq } from '../../types/validates/content-validate-types';
import { FolderDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class SetResourceFolderStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the delete status of the resource folder
   * @param  {AppContentStatusReq} params
   * @returns {Folder}
   */
  @Put('/folder-status')
  @OpenAPI({
    summary: i18n.sw.setResourceFolderStatus,
    description: '',
    tags: ['Resource'],
    operationId: 'set-resource-folder-status',
  })
  @ResponseSchema(FolderDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Folder>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.RESOURCE });
      const hasAuth = await this.service.auth.folder(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4121701);
      }

      const result = await this.service.folder.info.setFolderDeleteStatus(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.folder.invalidFolderId, 2121701);
      } else if (result.code === 2) {
        return Response.warning(i18n.resource.folderCannotBeDeleted, 2121702);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);
      const folderDetail = await this.service.folder.info.getDetailById(params.id);

      return Response.success(folderDetail, 1121701);
    } catch (err) {
      return Response.error(err, i18n.resource.setResourceFolderDeletedFailed, 3121701);
    }
  }
}
