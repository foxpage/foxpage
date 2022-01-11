import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes, Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PRE, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddProjectDetailReq, ProjectDetailRes } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { checkName, formatToPath, generationId } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class AddProjectDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create Project
   * 1, Get the parent folder Id of the project under the application
   * 2. Check if the project name is duplicated
   * 3, Create
   * @param  {FolderDetailReq} params
   * @param  {Header} headers
   * @returns {Folder}
   */
  @Post('')
  @OpenAPI({
    summary: i18n.sw.addProjectDetail,
    description: '/project/detail',
    tags: ['Project'],
    operationId: 'add-project-detail',
  })
  @ResponseSchema(ProjectDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddProjectDetailReq): Promise<ResData<Folder>> {
    if (!checkName(params.name)) {
      return Response.warning(i18n.project.invalidProjectName);
    }

    try {
      const folderDetail: Folder = Object.assign(_.omit(params, 'path'), {
        id: generationId(PRE.FOLDER),
        parentFolderId: '',
        folderPath: params.path ? formatToPath(params.path) : formatToPath(params.name),
        tags: [{ type: TYPE.PROJECT_FOLDER }],
        creator: ctx.userInfo.id,
      });

      const result = await this.service.folder.info.addTypeFolderDetail(folderDetail, {
        ctx,
        type: TYPE.PROJECT as AppFolderTypes,
      });

      if (result.code === 1) {
        return Response.warning(i18n.project.invalidType);
      } else if (result.code === 2) {
        return Response.warning(i18n.project.projectNameExist);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: folderDetail.id, type: TYPE.PROJECT });

      return Response.success(result.data as Folder);
    } catch (err) {
      return Response.error(err, i18n.project.addProjectFailed);
    }
  }
}
