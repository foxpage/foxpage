import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG, METHOD } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppContentStatusReq } from '../../types/validates/content-validate-types';
import { FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class SetTypeItemFileStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set type[variable|condition|function|mock|...] item file delete status
   * @param  {AppContentStatusReq} params
   * @returns {Content}
   */
  @Put('variables/status')
  @Put('conditions/status')
  @Put('functions/status')
  @Put('mocks/status')
  @OpenAPI({
    summary: i18n.sw.setVariableFileStatus,
    description: '',
    tags: ['File'],
    operationId: 'set-type-item-file-status',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppContentStatusReq): Promise<ResData<File>> {
    params.status = true; // Currently it is mandatory to only allow delete operations

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.DELETE, type: apiType });

      // permission and file id check
      const [hasAuth, fileDetail] = await Promise.all([
        this.service.auth.file(params.id, { ctx }),
        this.service.file.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4171301);
      }

      // file id is invalid or type is not mapping
      if (
        this.notValid(fileDetail) ||
        fileDetail.applicationId !== params.applicationId ||
        fileDetail.type !== apiType
      ) {
        return Response.accessDeny(i18n.content.invalidContentId, 2171302);
      }

      const result = await this.service.file.info.setFileDeleteStatus(params, {
        ctx,
        actionType: [LOG.DELETE, apiType].join('_'),
      });
      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2171301);
      } else if (result.code === 2) {
        return Response.warning(i18n.file.fileCannotBeDeleted, 2171303);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      fileDetail.deleted = true;

      return Response.success(fileDetail, 1171301);
    } catch (err) {
      return Response.error(err, i18n.variable.setVariableFileDeletedFailed, 3171301);
    }
  }
}
