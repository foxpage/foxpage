import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { NewFileInfo } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, FileVersionDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('variables')
export class AddVariableDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create variable details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addVariableDetail,
    description: '',
    tags: ['Variable'],
    operationId: 'add-variable-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileVersionDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2080101);
    }

    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4080101);
      }

      if (!params.folderId) {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.VARIABLE as AppFolderTypes,
        });

        if (!params.folderId) {
          return Response.warning(i18n.folder.invalidFolderId, 2080102);
        }
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: TYPE.VARIABLE });
      const result = await this.service.file.info.addFileDetail(newFileDetail, { ctx });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2080103);
      }

      // Check if the variable exists
      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2080104);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById((<File>result.data)?.id || '');

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data)?.id, type: TYPE.VARIABLE });

      return Response.success(
        Object.assign({ contentId: (<any>result.data)?.contentId }, fileDetail),
        1080101,
      );
    } catch (err) {
      return Response.error(err, i18n.variable.addNewVariableFailed, 3080101);
    }
  }
}
