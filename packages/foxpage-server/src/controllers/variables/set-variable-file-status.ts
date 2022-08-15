import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq } from '../../types/validates/content-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class SetVariableFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set the delete status of the variable file
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setVariableFileStatus,
    description: '',
    tags: ['Variable'],
    operationId: 'set-variable-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: TYPE.VARIABLE });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4080801);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, TYPE.VARIABLE].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2080801);
      } else if (result.code === 2) {
        return Response.warning(i18n.variable.fileCannotBeDeleted, 2080803);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1080801);
    } catch (err) {
      return Response.error(err, i18n.variable.setVariableFileDeletedFailed, 3080801);
    }
  }
}
