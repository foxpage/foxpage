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

@JsonController('conditions')
export class AddConditionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create condition details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addConditionDetail,
    description: '',
    tags: ['Condition'],
    operationId: 'add-condition-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileVersionDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2100101);
    }

    try {
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4100101);
      }

      if (!params.folderId) {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.CONDITION as AppFolderTypes,
        });

        if (!params.folderId) {
          return Response.warning(i18n.folder.invalidFolderId, 2100102);
        }
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: TYPE.CONDITION });
      const result = await this.service.file.info.addFileDetail(newFileDetail, { ctx });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 21001013);
      }

      // Check if the template exists
      if (result.code === 2) {
        return Response.warning(i18n.condition.conditionNameExist, 2100104);
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (result.data as File).id, type: TYPE.CONDITION });

      return Response.success(result.data || {}, 1100101);
    } catch (err) {
      return Response.error(err, i18n.condition.addNewConditionFailed, 3100101);
    }
  }
}
