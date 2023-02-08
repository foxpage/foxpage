import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ACTION, TYPE } from '../../../config/constant';
import { NewFileInfo } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddMockReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('mocks')
export class AddMockDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create mock details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addMockDetail,
    description: '',
    tags: ['Mock'],
    operationId: 'add-mock-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddMockReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2190101);
    }

    try {
      const hasAuth = await this.service.auth.content(params.contentId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4190101);
      }

      if (!params.folderId) {
        params.folderId = await this.service.folder.info.getAppTypeFolderId({
          applicationId: params.applicationId,
          type: TYPE.MOCK as AppFolderTypes,
        });

        if (!params.folderId) {
          return Response.warning(i18n.folder.invalidFolderId, 2190102);
        }
      }

      // format mock schema props value
      if (params.content?.schemas) {
        params.content.schemas = this.service.version.info.formatMockValue(
          params.content?.schemas,
          ACTION.SAVE,
        );
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: TYPE.MOCK });
      const result = await this.service.file.info.addFileDetail(newFileDetail, { ctx });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2190103);
      }

      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2190104);
      }

      // binding to content
      if (params.contentId) {
        await this.service.content.tag.updateExtensionTag(
          params.contentId,
          { mockId: (<any>result.data)?.contentId || '' },
          { ctx },
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const fileDetail = await this.service.file.info.getDetailById((<File>result.data)?.id || '');

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data)?.id, type: TYPE.MOCK });

      return Response.success(
        Object.assign({ contentId: (<any>result.data)?.contentId }, fileDetail),
        1080101,
      );
    } catch (err) {
      return Response.error(err, i18n.mock.addNewMockFailed, 3190101);
    }
  }
}
