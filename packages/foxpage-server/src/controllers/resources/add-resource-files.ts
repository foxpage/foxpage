import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { File, FileResourceType } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName, generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class AddResourceFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create resource file details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addResourceFileDetail,
    description: '/resource/file/detail',
    tags: ['Resource'],
    operationId: 'add-resource-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!params.name || !checkName(params.name)) {
      return Response.warning(i18n.resource.invalidName, 2120201);
    }

    if (!params.folderId) {
      return Response.warning(i18n.resource.invalidFolderId, 2120202);
    }

    try {
      // Check the existence of the file
      const [hasAuth, fileExist] = await Promise.all([
        this.service.auth.folder(params.folderId, { ctx }),
        this.service.file.info.checkExist(params),
      ]);

      if (fileExist) {
        return Response.warning(i18n.resource.resourceNameExist, 2120203);
      }

      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4120201);
      }

      // Create document details
      const fileDetail: Partial<File> = Object.assign({}, _.omit(params, 'type'), {
        id: generationId(PRE.FILE),
        type: TYPE.RESOURCE as FileResourceType,
      });

      this.service.file.info.create(fileDetail, { ctx });

      await this.service.file.info.runTransaction(ctx.transactions);
      const newFileDetail = await this.service.file.info.getDetailById(<string>fileDetail.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>fileDetail.id, type: TYPE.RESOURCE });

      return Response.success(newFileDetail, 1120201);
    } catch (err) {
      return Response.error(err, i18n.resource.addResourceFileFailed, 3120201);
    }
  }
}
