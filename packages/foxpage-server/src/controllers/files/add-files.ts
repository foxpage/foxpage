import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { FileDetailReq, FileDetailRes } from '../../types/validates/file-validate-types';
import * as Response from '../../utils/response';
import { checkName, generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('file')
export class AddFileDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create document details
   * @param  {FileDetailReq} params
   * @param  {Header} headers
   * @returns {File}
   */
  @Post('/detail')
  @OpenAPI({
    summary: i18n.sw.addFileDetail,
    description: '',
    tags: ['File'],
    operationId: 'add-file-detail',
  })
  @ResponseSchema(FileDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: FileDetailReq): Promise<ResData<File>> {
    // Check the validity of the name
    if (!checkName(params.name)) {
      return Response.warning(i18n.file.invalidName, 2170101);
    }

    try {
      const [appDetail, fileExist] = await Promise.all([
        this.service.application.getDetailById(params.applicationId),
        this.service.file.info.getDetail(Object.assign({ deleted: false }, params)),
      ]);

      // Check the validity of the application ID
      if (this.notValid(appDetail)) {
        return Response.warning(i18n.app.idInvalid, 2170102);
      }

      // Check the existence of the file
      if (fileExist) {
        return Response.warning(i18n.file.nameExist, 2170103);
      }

      // Add file info
      const fileDetail = Object.assign({}, params, { id: generationId(PRE.FILE), creator: '' });
      this.service.file.info.create(fileDetail, { ctx });

      // By default, a content page is created at the same time as the file is created
      const contentDetail: Content = {
        id: generationId(PRE.CONTENT),
        title: params.name,
        fileId: <string>fileDetail.id,
        type: fileDetail.type || '',
        applicationId: fileDetail.applicationId,
        tags: [],
        creator: '',
        liveVersionNumber: 0,
      };
      this.service.content.info.create(contentDetail, { ctx });

      // For page type file, template, a content version needs to be created by default
      if (['page', 'template'].indexOf(params.type) !== -1) {
        const newVersionDetail: ContentVersion = {
          id: generationId(PRE.CONTENT_VERSION),
          contentId: contentDetail.id,
          version: '0.0.1',
          versionNumber: 1,
          creator: '',
          content: <any>{ id: contentDetail.id },
        };
        this.service.version.info.create(newVersionDetail, { ctx });
      }

      await this.service.file.info.runTransaction(ctx.transactions);
      const newFileDetail = await this.service.file.info.getDetailById(<string>fileDetail.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: <string>newFileDetail.id, type: TYPE.FILE });

      return Response.success(newFileDetail, 1170101);
    } catch (err) {
      return Response.error(err, i18n.file.addNewFailed, 3170101);
    }
  }
}
