import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { NewFileInfo } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('')
export class AddPageDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create page / template / block details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('pages')
  @Post('templates')
  @Post('blocks')
  @OpenAPI({
    summary: i18n.sw.addPageDetail,
    description: '',
    tags: ['Page'],
    operationId: 'add-page-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileDetailReq): Promise<ResData<File>> {
    if (!checkName(params.name) || !params.name) {
      return Response.warning(i18n.file.invalidName, 2050201);
    }

    if (!params.folderId) {
      return Response.warning(i18n.folder.invalidFolderId, 2050202);
    }

    const apiType = this.getRoutePath(ctx.request.url);

    try {
      // Check permission
      const [hasAuth, fileCount] = await Promise.all([
        this.service.auth.folder(params.folderId, { ctx }),
        this.service.file.info.getCount({ folderId: params.folderId, deleted: false, type: TYPE.PAGE }),
      ]);

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4050201);
      }

      if (fileCount >= 20) {
        return Response.warning(i18n.file.allowMax20Files, 2050206);
      }

      params.tags = this.service.content.tag.formatTags(apiType, params.tags);
      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: apiType });
      const result = await this.service.file.info.addFileDetail(newFileDetail, {
        ctx,
        actionDataType: apiType,
      });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2050203);
      }

      // Check the existence of the file
      if (result.code === 2) {
        return Response.warning(i18n.file.nameExist, 2050204);
      }

      // Check if the path of the file already exists
      if (result.code === 3) {
        return Response.warning(
          i18n.file.pathNameExist + ':"' + ((result.data || []) as string[]).join(',') + '"',
          2050205,
        );
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data).id, type: TYPE.PAGE });

      return Response.success(result.data || {}, 1050201);
    } catch (err) {
      return Response.error(err, i18n.page.addNewPageFailed, 3050201);
    }
  }
}
