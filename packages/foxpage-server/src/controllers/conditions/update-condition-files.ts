import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('conditions')
export class UpdateConditionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update condition file details, only condition name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('/files')
  @OpenAPI({
    summary: i18n.sw.updateConditionFileDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'update-condition-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidConditionName, 2101401);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.CONDITION });

      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4101401);
      }

      const result = await this.service.file.info.updateFileDetail(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.condition.invalidConditionId, 2101402);
      }

      if (result.code === 2) {
        return Response.warning(i18n.condition.conditionNameExist, 2101403);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1101401);
    } catch (err) {
      return Response.error(err, i18n.condition.updateConditionFailed, 3101401);
    }
  }
}
