import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq } from '../../types/validates/content-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class SetResourceFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the deletion status of resource files
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/file-status')
  @OpenAPI({
    summary: i18n.sw.setResourceFileStatus,
    description: '',
    tags: ['Resource'],
    operationId: 'set-resource-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.RESOURCE });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4121601);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2121601);
      } else if (result.code === 2) {
        return Response.warning(i18n.resource.fileCannotBeDeleted, 2121602);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1121601);
    } catch (err) {
      return Response.error(err, i18n.resource.setResourceFileDeletedFailed, 3121601);
    }
  }
}
