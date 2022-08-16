import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class SetResourceGroupStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set resource group deletion status
   * @param  {AppContentStatusReq} params
   * @returns {Folder}
   */
  @Put('/group-status')
  @OpenAPI({
    summary: i18n.sw.setResourceGroupStatus,
    description: '',
    tags: ['Resource'],
    operationId: 'set-resource-group-status',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<Folder>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.RESOURCE });
      const hasAuth = await this.service.auth.folder(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4121801);
      }

      const folderObject = await this.service.folder.list.getAllParentsRecursive([params.id]);
      if (
        !folderObject[params.id] ||
        folderObject[params.id].length < 2 ||
        _.nth(folderObject[params.id], -2)?.parentFolderId !== ''
      ) {
        return Response.warning(i18n.resource.invalidResourceGroupId, 2121801);
      }

      const result = await this.service.folder.info.setFolderDeleteStatus(params, { ctx, checkType: 2 });
      if (result.code === 1) {
        return Response.warning(i18n.folder.invalidFolderId, 2121802);
      } else if (result.code === 2) {
        return Response.warning(i18n.resource.folderCannotBeDeleted, 2121803);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);
      const folderDetail = await this.service.folder.info.getDetailById(params.id);

      return Response.success(folderDetail, 1121801);
    } catch (err) {
      return Response.error(err, i18n.resource.setResourceGroupDeletedFailed, 3121801);
    }
  }
}
