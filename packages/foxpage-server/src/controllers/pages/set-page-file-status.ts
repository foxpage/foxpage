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

@JsonController('pages')
export class SetPageFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * 设置页面文件的删除状态
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setPageFileStatus,
    description: '',
    tags: ['Page'],
    operationId: 'set-page-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.PAGE });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4051201);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2051201);
      } else if (result.code === 2) {
        return Response.warning(i18n.page.fileCannotBeDeleted, 251202);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 4151201);
    } catch (err) {
      return Response.error(err, i18n.page.setPageFileDeletedFailed, 3051201);
    }
  }
}
