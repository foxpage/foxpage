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

@JsonController('functions')
export class SetFunctionFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the delete status of the function file
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setFunctionFileStatus,
    description: '',
    tags: ['Function'],
    operationId: 'set-function-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.FUNCTION });

      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4090801);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2090801);
      } else if (result.code === 2) {
        return Response.warning(i18n.function.fileCannotBeDeleted, 2090802);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1090801);
    } catch (err) {
      return Response.error(err, i18n.function.setFunctionFileDeletedFailed, 3090801);
    }
  }
}
