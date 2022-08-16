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
export class GetWorkspaceRecycleList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get current user all deleted object list, includes project, variable, conditions eg.
   *
   * But current only response deleted projects
   * @param  {WorkspaceProjectListReq} params
   * @param  {Header} headers
   * @returns {FolderInfo}
   */
  @Get('/recycle-searchs')
  @OpenAPI({
    summary: i18n.sw.getWorkspaceRecycleList,
    description: '',
    tags: ['Workspace'],
    operationId: 'get-workspace-recycle-list',
  })
  @ResponseSchema(ProjectListRes)
  async index (
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: WorkspaceProjectListReq,
  ): Promise<ResData<PageData<FolderInfo>>> {
    try {
      this.service.folder.info.setPageSize(params);

      const creator = ctx.userInfo.id;
      if (!creator) {
        return Response.warning(i18n.user.invalidUser, 2140401);
      }

      const folderInfoList = await this.service.folder.list.getWorkspaceFolderList(
        Object.assign(
          {
            creator,
            types: [TYPE.PROJECT_FOLDER],
            deleted: true,
            sort: {
              updateTime: -1,
            },
          },
          params,
        ),
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
        1140401,
      );
    } catch (err) {
      return Response.error(err, i18n.project.getWorkspaceRecycleListFailed, 3140401);
    }
  }
}
