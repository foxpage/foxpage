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

@JsonController()
export class AddProjectDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create Project
   * 1, Get the parent folder Id of the project under the application
   * 2. Check if the project name is duplicated
   * 3, Create project
   * @param  {FolderDetailReq} params
   * @param  {Header} headers
   * @returns {Folder}
   */
  @Post('projects')
  @Post('workspace/projects')
  @Post('applications/projects')
  @OpenAPI({
    summary: i18n.sw.addProjectDetail,
    description: '/project/detail',
    tags: ['Project'],
    operationId: 'add-project-detail',
  })
  @ResponseSchema(ProjectDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddProjectDetailReq): Promise<ResData<Folder>> {
    if (!checkName(params.name) || !params.name) {
      return Response.warning(i18n.project.invalidProjectName, 2040201);
    }

    try {
      // const hasAuth = await this.service.auth.application(params.applicationId, { ctx });
      // if (!hasAuth) {
      //   return Response.accessDeny(i18n.system.accessDeny, 4040201);
      // }

      let tags: Record<string, string>[] = [{ type: TYPE.PROJECT_FOLDER }];
      params.organizationId && tags.push({ type: TYPE.ORGANIZATION, typeId: params.organizationId });
      const folderDetail: Folder = Object.assign(_.omit(params, 'path'), {
        id: generationId(PRE.FOLDER),
        parentFolderId: '',
        folderPath: params.path ? formatToPath(params.path) : formatToPath(params.name),
        tags: tags,
        creator: ctx.userInfo.id,
      });

      const result = await this.service.folder.info.addTypeFolderDetail(folderDetail, {
        ctx,
        type: TYPE.PROJECT as AppFolderTypes,
        actionDataType: TYPE.PROJECT,
      });

      if (result.code === 1) {
        return Response.warning(i18n.project.invalidType, 2040202);
      } else if (result.code === 2) {
        return Response.warning(i18n.project.projectNameExist, 2040203);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: folderDetail.id, type: TYPE.PROJECT });

      return Response.success(result.data as Folder, 1040201);
    } catch (err) {
      return Response.error(err, i18n.project.addProjectFailed, 3040201);
    }
  }
}
