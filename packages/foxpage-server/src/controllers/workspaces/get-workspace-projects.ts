import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FolderInfo } from '../../types/file-types';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { ProjectListRes, WorkspaceProjectListReq } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('workspaces')
export class GetWorkspaceProjectPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get current user all project list, exclude deleted project
   * @param  {WorkspaceProjectListReq} params
   * @param  {Header} headers
   * @returns {FolderInfo}
   */
  @Get('/project-searchs')
  @OpenAPI({
    summary: i18n.sw.getWorkspaceProjectList,
    description: '',
    tags: ['Workspace'],
    operationId: 'get-workspace-project-list',
  })
  @ResponseSchema(ProjectListRes)
  async index (
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: WorkspaceProjectListReq,
  ): Promise<ResData<PageData<FolderInfo>>> {
    try {
      const creator = ctx.userInfo.id;
      if (!creator) {
        return Response.warning(i18n.user.invalidUser, 2140301);
      }

      this.service.folder.info.setPageSize(params);

      const folderInfoList = await this.service.folder.list.getWorkspaceFolderList(
        Object.assign({ creator, types: [TYPE.PROJECT_FOLDER] }, params),
      );

      return Response.success(
        {
          pageInfo: {
            page: params.page,
            size: params.size,
            total: folderInfoList.count,
          },
          data: folderInfoList.list,
        },
        1140301,
      );
    } catch (err) {
      return Response.error(err, i18n.project.getWorkspaceProjectListFailed, 3140301);
    }
  }
}
