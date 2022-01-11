import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppFolderTypes } from '@foxpage/foxpage-server-types';

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
      const userInOrg = await this.service.org.checkUserInOrg(params.organizationId, ctx.userInfo.id);
      if (!userInOrg) {
        return Response.warning(i18n.project.userNotInOrg);
      }

      let appIds: string[] = [];
      if (params.applicationId) {
        const appDetail = await this.service.application.getDetailById(params.applicationId);
        appDetail.organizationId === params.organizationId && (appIds = [appDetail.id]);
      } else {
        const appList = await this.service.application.find({ organizationId: params.organizationId });
        appIds = _.map(appList, 'id');
      }

      // Get the id of the specified default folder under the application
      const folderIds = await this.service.folder.info.getAppDefaultFolderIds({
        applicationIds: appIds,
        type: TYPE.PROJECT as AppFolderTypes,
      });

      let orgFolderData: PageData<FolderInfo> = { list: [], count: 0 };
      if (folderIds.size > 0) {
        orgFolderData = await this.service.folder.list.getFolderChildrenList(
          Object.assign(_.pick(params, ['page', 'size', 'search']), { parentFolderIds: [...folderIds] }),
        );
      }
      return Response.success({
        pageInfo: {
          page: params.page,
          size: params.size,
          total: orgFolderData.count,
        },
        data: orgFolderData.list,
      });
    } catch (err) {
      return Response.error(err, i18n.org.getOrgFolderFailed);
    }
  }
}
