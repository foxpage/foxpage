import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { FolderInfo } from '../../types/file-types';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { ProjectListReq, ProjectListRes } from '../../types/validates/project-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('project-searchs')
export class GetProjectPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the paging data of the project under the organization,
   * if the applicationId is passed, get the project under the application
   * 1. Get all applications under the organization
   * 2, Get all the folders (Projects) under the application in reverse order by folder creation time
   *
   * filter project data by type (user|team|organization app)
   * @param  {ProjectListReq} params
   * @param  {Header} headers
   * @returns {FolderInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getProjectList,
    description: '',
    tags: ['Project'],
    operationId: 'get-page-project-list',
  })
  @ResponseSchema(ProjectListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: ProjectListReq,
  ): Promise<ResData<PageData<FolderInfo>>> {
    try {
      // Check the validity of the organization ID and whether the user is under the organization
      if (params.organizationId) {
        const userInOrg = await this.service.org.checkUserInOrg(params.organizationId, ctx.userInfo.id);
        if (!userInOrg) {
          return Response.warning(i18n.project.userNotInOrg, 2040401);
        }
      }

      let appIds: string[] = [];
      if (params.applicationId) {
        const appDetail = await this.service.application.getDetailById(params.applicationId);
        appIds = [appDetail.id];
      } else if (params.organizationId) {
        const appList = await this.service.application.find({ organizationId: params.organizationId });
        appIds = _.map(appList, 'id');
      }

      // response empty when app id is invalid
      if (appIds.length === 0 && [TYPE.TEAM, TYPE.USER, TYPE.INVOLVE].indexOf(params.type) === -1) {
        return Response.success(
          { pageInfo: { page: params.page, size: params.size, total: 0 }, data: [] },
          1040402,
        );
      }

      let userIds: string[] = [];
      if (params.type === TYPE.TEAM) {
        // get teams users
        const teamProjectParams = Object.assign(params.typeId ? { id: params.typeId } : {}, {
          'members.userId': ctx.userInfo.id,
        });
        const teamList = await this.service.team.find(teamProjectParams);
        teamList.forEach((team) => {
          userIds.push(
            ..._.map(
              _.filter(team?.members || [], (member) => member.status),
              'userId',
            ),
          );
        });
        userIds.length === 0 ? (userIds = [ctx.userInfo.id]) : (userIds = _.uniq(userIds));
      } else if (params.type === TYPE.USER) {
        userIds = [ctx.userInfo.id];
      }

      const baseSearchParams = Object.assign(
        { applicationIds: appIds },
        _.pick(params, ['page', 'size', 'search']),
      );

      let orgFolderData: PageData<FolderInfo> = { list: [], count: 0 };
      if (params.type === TYPE.INVOLVE) {
        if (params.searchType && params.searchType === TYPE.FILE) {
          orgFolderData = await this.service.folder.list.getInvolveFileProject(
            Object.assign(baseSearchParams, { userId: ctx.userInfo.id }),
          );
        } else {
          orgFolderData = await this.service.folder.list.getInvolveProject(
            Object.assign(baseSearchParams, { userId: ctx.userInfo.id }),
          );
        }
      } else {
        // search current user create files, response folder list
        if (params.searchType && params.searchType === TYPE.FILE) {
          orgFolderData = await this.service.folder.list.getUserFolderListByFile(
            Object.assign(baseSearchParams, { userId: userIds[0] || '' }),
          );
        } else {
          // search current user create folders
          orgFolderData = await this.service.folder.list.getFolderChildrenList(
            Object.assign(baseSearchParams, {
              userIds,
              searchType: params.searchType || TYPE.PROJECT_FOLDER,
            }),
          );
        }
      }

      return Response.success(
        {
          pageInfo: {
            page: params.page,
            size: params.size,
            total: orgFolderData.count,
          },
          data: orgFolderData.list,
        },
        1040401,
      );
    } catch (err) {
      return Response.error(err, i18n.org.getOrgFolderFailed, 3040401);
    }
  }
}
