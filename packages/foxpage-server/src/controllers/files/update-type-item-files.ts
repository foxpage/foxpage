import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, UpdateFileDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController()
export class UpdateTypeItemFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update type item [variable|condition|function|mock|...] details, only name and introduction can be updated
   * @param  {UpdateFileDetailReq} params
   * @returns {File}
   */
  @Put('variables/files')
  @Put('conditions/files')
  @Put('functions/files')
  @Put('mocks/files')
  @OpenAPI({
    summary: i18n.sw.updateVariableFileDetail,
    description: '',
    tags: ['File'],
    operationId: 'update-variable-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateFileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2171201);
    }

    try {
      const apiType = this.getRoutePath(ctx.request.url);
      ctx.logAttr = Object.assign(ctx.logAttr, { type: apiType });

      let [hasAuth, fileDetail] = await Promise.all([
        this.service.auth.file(params.pageFileId || params.id, { ctx }),
        this.service.file.info.getDetailById(params.id),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4171201);
      }

      // file id is invalid or type is not mapping
      if (
        this.notValid(fileDetail) ||
        fileDetail.applicationId !== params.applicationId ||
        fileDetail.type !== apiType
      ) {
        return Response.warning(i18n.file.invalidFileId, 2171202);
      }

      const result = await this.service.file.info.updateFileDetail(params, {
        ctx,
        actionType: [LOG.UPDATE, apiType].join('_'),
      });

      if (result.code === 1) {
        return Response.warning(i18n.file.invalidFileId, 2171203);
      } else if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2171204);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      fileDetail = await this.service.file.info.getDetailById(params.id);

      return Response.success(fileDetail, 1171201);
    } catch (err) {
      return Response.error(err, i18n.file.updateFailed, 3171201);
    }
  }
}
