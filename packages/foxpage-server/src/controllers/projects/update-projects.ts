import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Folder } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { AppTypeFolderUpdate } from '../../types/file-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { ProjectDetailRes, UpdateProjectDetailReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { checkName } from '../../utils/tools';
import { BaseController } from '../base-controller';

@JsonController('projects')
export class UpdateProjectDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Update project details, only name, path and introduction can be updated
   * @param  {UpdateProjectDetailReq} params
   * @returns {Folder}
   */
  @Put('')
  @OpenAPI({
    summary: i18n.sw.updateProjectDetail,
    description: '/project/detail',
    tags: ['Project'],
    operationId: 'update-project-detail',
  })
  @ResponseSchema(ProjectDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: UpdateProjectDetailReq): Promise<ResData<Folder>> {
    try {
      const hasAuth = await this.service.auth.folder(params.projectId, { ctx });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4040901);
      }

      if (!params.name || !checkName(params.name)) {
        return Response.warning(i18n.folder.invalidName, 2040901);
      }

      const folderDetail: AppTypeFolderUpdate = Object.assign(
        _.pick(params, ['applicationId', 'name', 'intro']),
        {
          id: params.projectId,
          folderPath: params.path || undefined,
        },
      );

      const result = await this.service.folder.info.updateTypeFolderDetail(folderDetail, { ctx });

      if (result.code === 1) {
        return Response.warning(i18n.folder.invalidFolderId, 2040902);
      } else if (result.code === 2) {
        return Response.warning(i18n.folder.nameExist, 2040903);
      }

      await this.service.folder.info.runTransaction(ctx.transactions);
      const newFolderDetail = await this.service.folder.info.getDetailById(params.projectId);

      ctx.logAttr = Object.assign(ctx.logAttr, { id: params.projectId, type: TYPE.PROJECT });

      return Response.success(newFolderDetail, 1040901);
    } catch (err) {
      return Response.error(err, i18n.project.updateProjectFailed, 3040901);
    }
  }
}
