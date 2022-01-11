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

@JsonController('pages')
export class UpdatePageDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update file details, only file name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updatePageDetail,
    description: '',
    tags: ['Page'],
    operationId: 'update-page-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidPageName);
    }

    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { type: TYPE.PAGE });
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      const result: Record<string, any> = await this.service.file.info.updateFileDetail(params, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.page.invalidPageId);
      }

      if (result.code === 2) {
        return Response.warning(i18n.page.pageNameExist);
      }

      // Check if the path of the file already exists
      if (result.code === 3) {
        return Response.warning(i18n.file.pathNameExist);
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      // Get file details
      const pageDetail: File = await this.service.file.info.getDetailById(params.id);

      return Response.success(pageDetail);
    } catch (err) {
      return Response.error(err, i18n.file.updateFailed);
    }
  }
}
