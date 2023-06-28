import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { NewFileInfo } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailRes, FileVersionDetailReq } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('')
export class AddTypeItemDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create type item detail, include variable, condition, function, mock
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('variables')
  @Post('conditions')
  @Post('functions')
  // @Post('mocks')
  @OpenAPI({
    summary: i18n.sw.addTypeItemDetail,
    description: '',
    tags: ['File'],
    operationId: 'add-type-item-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileVersionDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2170701);
    }

    const apiType = this.getRoutePath(ctx.request.url);

    try {
      let hasAuth = false;
      if (params.pageContentId) {
        hasAuth = await this.service.auth.content(params.pageContentId, { ctx });
      } else if (params.folderId) {
        hasAuth = await this.service.auth.folder(params.folderId, { ctx });
      } else {
        hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4170701);
      }

      if (!params.folderId) {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: apiType as AppFolderTypes,
        });

        if (!params.folderId) {
          return Response.warning(i18n.folder.invalidFolderId, 2170702);
        }
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: apiType });
      const result = await this.service.file.info.addFileDetail(newFileDetail, {
        ctx,
        actionDataType: apiType,
      });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2170703);
      }

      // Check if the type item exists
      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2170704);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById((<File>result.data)?.id || '');

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data)?.id, type: apiType });

      return Response.success(
        Object.assign({ contentId: (<any>result.data)?.contentId }, fileDetail),
        1170701,
      );
    } catch (err) {
      return Response.error(err, i18n.item.addNewItemFailed, 3170701);
    }
  }
}
