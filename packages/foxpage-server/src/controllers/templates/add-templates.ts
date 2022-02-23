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

@JsonController('templates')
export class AddTemplateDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create template details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addTemplateDetail,
    description: '/',
    tags: ['Template'],
    operationId: 'add-template-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2070201);
    }

    try {
      if (!params.folderId) {
        return Response.warning(i18n.folder.invalidFolderId, 2070202);
      }

      const newFileDetail: NewFileInfo = Object.assign({}, params, { type: TYPE.TEMPLATE });
      const result = await this.service.file.info.addFileDetail(newFileDetail, { ctx });

      // Check the validity of the application ID
      if (result.code === 1) {
        return Response.warning(i18n.app.idInvalid, 2070203);
      }

      // Check if the template exists
      if (result.code === 2) {
        return Response.warning(i18n.template.templateNameExist, 2070204);
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const templateFileDetail = await this.service.file.info.getDetailById((result?.data as File)?.id || '');

      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data).id, type: TYPE.TEMPLATE });

      return Response.success(templateFileDetail, 1070201);
    } catch (err) {
      return Response.error(err, i18n.template.addNewTemplateFailed, 3070201);
    }
  }
}
