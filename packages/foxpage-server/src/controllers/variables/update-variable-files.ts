import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class UpdateVariableFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update variable details, only variable name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('/files')
  @OpenAPI({
    summary: i18n.sw.updateVariableFileDetail,
    description: '',
    tags: ['Variable'],
    operationId: 'update-variable-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.variable.invalidVariableName, 2081301);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.VARIABLE });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4081301);
      }

      const result = await this.service.file.info.updateFileDetail(params, {
        ctx,
        actionType: [LOG.UPDATE, TYPE.VARIABLE].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.variable.invalidVariableId, 2081302);
      }

      if (result.code === 2) {
        return Response.warning(i18n.variable.variableNameExist, 2081303);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1081301);
    } catch (err) {
      return Response.error(err, i18n.variable.updateVariableFailed, 3081301);
    }
  }
}
