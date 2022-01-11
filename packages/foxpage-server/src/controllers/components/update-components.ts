import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { UpdateComponentReq } from '../../types/validates/component-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class UpdateComponentFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update component file information, currently only the file profile can be updated
   * @param  {UpdateComponentReq} params
   * @returns {ContentVersion}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateComponentFileDetail,
    description: '',
    tags: ['Component'],
    operationId: 'update-component-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateComponentReq): Promise<ResData<File>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      const result = await this.service.file.info.updateFileDetail(params, { ctx });
      if (result.code === 1) {
        return Response.warning(i18n.component.invalidFileId);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.COMPONENT });

      return Response.success(fileDetail);
    } catch (err) {
      return Response.error(err, i18n.component.updateComponentFileFailed);
    }
  }
}
