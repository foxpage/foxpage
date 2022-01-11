import 'reflect-metadata';

import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { DeleteFileReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('file')
export class SetFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set file deletion status
   * @param  {DeleteFileReq} params
   * @returns {File}
   */
  @Put('/delete')
  @OpenAPI({
    summary: i18n.sw.setFileDeleteStatus,
    description: '',
    tags: ['File'],
    operationId: 'set-file-delete',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: DeleteFileReq): Promise<ResData<File>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE });

      // Permission check
      const hasAuth = await this.service.auth.file(params.id, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny);
      }

      const fileDetail = await this.service.file.info.getDetailById(params.id);
      if (!fileDetail) {
        return Response.warning(i18n.file.invalidFileId);
      }

      // Set status
      await this.service.file.info.updateDetail(params.id, {
        deleted: params.status !== undefined ? params.status : true,
      });

      // Get file details
      const newFileDetail: File = await this.service.file.info.getDetailById(params.id);

      return Response.success(newFileDetail);
    } catch (err) {
      return Response.error(err, i18n.file.setDeleteStatusFailed);
    }
  }
}
