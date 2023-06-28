import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Content, File, FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { COMPONENT_TYPE, TYPE } from '../../../config/constant';
import { NewFileInfo } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddComponentReq } from '../../types/validates/component-validate-types';
import { ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class AddComponentDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create component details
   * @param  {AddComponentReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addComponentDetail,
    description: '/component/detail',
    tags: ['Component'],
    operationId: 'add-component-detail',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddComponentReq): Promise<ResData<Content>> {
    try {
      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4110201);
      }

      // Get the default folder Id of the application component
      const appComponentFolderId = await this.service.folder.info.getAppTypeFolderId({
        applicationId: params.applicationId,
        type: TYPE.COMPONENT as AppFolderTypes,
      });

      if (!appComponentFolderId) {
        return Response.warning(i18n.component.invalidFolderType, 2110201);
      }

      // Create page content information
      const fileDetail: NewFileInfo = {
        applicationId: params.applicationId,
        folderId: appComponentFolderId,
        name: params.name,
        type: params.type as FileTypes,
        componentType: params.componentType || COMPONENT_TYPE.REACT_COMPONENT,
        suffix: '',
        creator: '',
      };

      const result = await this.service.file.info.addFileDetail(fileDetail, {
        ctx,
        actionDataType: TYPE.COMPONENT,
      });

      if (result.code === 1) {
        return Response.warning(i18n.component.invalidApplicationId, 2110202);
      }

      // Check if there is a component with the same name
      if (result.code === 2) {
        return Response.warning(i18n.component.nameExist, 2110203);
      }

      await this.service.file.info.runTransaction(ctx.transactions);

      const newFileDetail = await this.service.file.info.getDetailById((<File>result.data).id);
      ctx.logAttr = Object.assign(ctx.logAttr, { id: (<File>result.data).id, type: TYPE.COMPONENT });

      return Response.success(newFileDetail, 1110201);
    } catch (err) {
      return Response.error(err, i18n.content.addContentBaseFailed, 3110201);
    }
  }
}
