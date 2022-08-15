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

@JsonController('mocks')
export class UpdateMockFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update mock details, only mock name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('/files')
  @OpenAPI({
    summary: i18n.sw.updateMockFileDetail,
    description: '',
    tags: ['Mock'],
    operationId: 'update-mock-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.mock.invalidMockName, 2191301);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.MOCK });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4191301);
      }

      const result = await this.service.file.info.updateFileDetail(params, {
        ctx,
        actionType: [LOG.UPDATE, TYPE.MOCK].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.mock.invalidMockId, 2191302);
      }

      if (result.code === 2) {
        return Response.warning(i18n.mock.mockNameExist, 2191303);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1191301);
    } catch (err) {
      return Response.error(err, i18n.mock.updateMockFailed, 3191301);
    }
  }
}
