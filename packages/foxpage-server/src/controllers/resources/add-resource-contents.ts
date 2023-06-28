import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion, File, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { ContentVersionDetailRes } from '../../types/validates/content-validate-types';
import { AddResourceContentReq } from '../../types/validates/resource-validate-types';
import * as Response from '../../utils/response';
import { generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('resources')
export class AddResourceContentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Added resource content information, resource files, resource content,
   * and resource content version information will be added at the same time
   * @param  {AddResourceContentReq} params
   * @param  {Header} headers
   * @returns {ContentVersion}
   */
  @Post('/contents')
  @OpenAPI({
    summary: i18n.sw.addResourceContentDetail,
    description: '',
    tags: ['Resource'],
    operationId: 'add-resource-content-detail',
  })
  @ResponseSchema(ContentVersionDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddResourceContentReq): Promise<ResData<ContentVersion>> {
    try {
      let fileTitle = _.last(params.content.realPath?.split('/')) || '';
      if (!fileTitle) {
        return Response.warning(i18n.resource.invalidName, 2120101);
      }

      const hasAuth = await this.service.auth.folder(params.folderId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4120101);
      }

      // content title default remove has value
      const fileTitleArr = fileTitle.split('.');
      fileTitle = fileTitleArr[0] + '.' + _.last(fileTitleArr);

      // Get all the files in the current folder, check whether the file with the same name already exists
      let fileDetail = await this.service.file.info.getDetail({
        folderId: params.folderId,
        name: fileTitle,
        type: TYPE.RESOURCE as FileTypes,
        deleted: false,
      });

      if (fileDetail) {
        return Response.warning(i18n.resource.resourceNameExist, 2120102);
      }

      const resourceFileDetail: File = {
        id: generationId(PRE.FILE),
        name: fileTitle,
        applicationId: params.applicationId,
        folderId: params.folderId,
        intro: '',
        type: TYPE.RESOURCE as FileTypes,
        suffix: 'fp',
        creator: ctx.userInfo.id,
      };

      // Compatible with the prefix '/' of realPath
      params.content.realPath = '/' + _.pull(params.content.realPath.split('/'), '').join('/');

      this.service.file.info.createFileContentVersion(resourceFileDetail, { ctx, content: params.content });

      await this.service.file.info.runTransaction(ctx.transactions);
      fileDetail = await this.service.file.info.getDetailById(resourceFileDetail.id);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: resourceFileDetail.id, type: TYPE.RESOURCE });

      return Response.success(fileDetail, 1120101);
    } catch (err) {
      return Response.error(err, i18n.resource.addResourceContentFailed, 3120101);
    }
  }
}
