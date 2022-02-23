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

@JsonController('templates')
export class UpdateTemplateDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update the template details, only the template name and profile can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateTemplateDetail,
    description: '',
    tags: ['Template'],
    operationId: 'update-template-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.template.invalidTemplateName, 2071701);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.TEMPLATE });

      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4071701);
      }

      const result = await this.service.file.info.updateFileDetail(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.template.invalidTemplateId, 2071702);
      }

      if (result.code === 2) {
        return Response.warning(i18n.template.templateNameExist, 2071703);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1071701);
    } catch (err) {
      return Response.error(err, i18n.template.updateTemplateFailed, 3071701);
    }
  }
}
