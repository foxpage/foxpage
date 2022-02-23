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

@JsonController('functions')
export class AddFunctionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create function details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addFunctionDetail,
    description: '',
    tags: ['Function'],
    operationId: 'add-function-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileVersionDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2090101);
    }

    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4090101);
      }

      if (!params.folderId) {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.FUNCTION as AppFolderTypes,
        });

        if (!params.folderId) {
          return Response.warning(i18n.folder.invalidFolderId, 2090102);
        }
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: TYPE.FUNCTION });
      const result = await this.service.file.info.addFileDetail(newFileDetail, { ctx });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2090103);
      }

      // Check if the function exists
      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2090104);
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data).id, type: TYPE.FUNCTION });

      return Response.success(result.data || {}, 1090101);
    } catch (err) {
      return Response.error(err, i18n.function.addNewFunctionFailed, 3090101);
    }
  }
}
