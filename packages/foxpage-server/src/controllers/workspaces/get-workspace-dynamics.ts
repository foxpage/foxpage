import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Log } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { DynamicListRes, WorkspaceDynamicListReq } from '../../types/validates/log-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';
import { UserBase } from '../../../src/types/user-types';

type DynamicItem = Log & {
  dataType: {
    scope: string;
    action: string;
    type: string;
  };
  creator: UserBase;
};
@JsonController('workspaces')
export class GetWorkspaceDynamicList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get current user page data operation.
   *
   * @param  {WorkspaceDynamicListReq} params
   * @returns {Log}
   */
  @Get('/dynamic-searchs')
  @OpenAPI({
    summary: i18n.sw.getWorkspaceDynamicList,
    description: '',
    tags: ['Workspace'],
    operationId: 'get-workspace-dynamic-list',
  })
  @ResponseSchema(DynamicListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: WorkspaceDynamicListReq,
  ): Promise<ResData<PageData<DynamicItem>>> {
    try {
      const creator = ctx.userInfo.id;
      if (!creator) {
        return Response.warning(i18n.user.invalidUser, 2140201);
      }

      const orgDetail = await this.service.org.getDetail({
        id: params.organizationId,
        members: { $elemMatch: { userId: ctx.userInfo.id, status: true } },
      });

      if (!orgDetail || _.isEmpty(orgDetail)) {
        return Response.success(
          {
            pageInfo: {
              page: params.page,
              size: params.size,
              total: 0,
            },
            data: [],
          },
          1140202,
        );
      }

      this.service.folder.info.setPageSize(params);

      // Default time range is last 7 days
      if (!params.startTime || !params.endTime) {
        params.startTime = new Date().getTime() - 7 * 86400000;
        params.endTime = new Date().getTime();
      }

      const operationResult = await this.service.log.getUserOperationList(
        Object.assign({ operator: creator, organizationId: orgDetail.id }, params),
      );

      // Get operation data base info, include app name
      let versionIds: string[] = [];
      let contentIds: string[] = [];
      let fileIds: string[] = [];
      let folderIds: string[] = [];
      let applicationIds: string[] = [];
      let userIds: string[] = [];
      operationResult.list.forEach((data) => {
        data.category?.versionId && versionIds.push(data.category.versionId);
        data.category?.contentId && contentIds.push(data.category.contentId);
        data.category?.fileId && fileIds.push(data.category.fileId);
        data.category?.folderId && folderIds.push(data.category.folderId);
        data.category?.applicationId && applicationIds.push(data.category?.applicationId);
        userIds.push(data.operator);
      });

      const [
        versionObject,
        contentObject,
        fileObject,
        folderObject,
        appObject,
        userObject,
      ] = await Promise.all([
        this.service.version.info.getDetailObjectByIds(_.uniq(versionIds)),
        this.service.content.info.getDetailObjectByIds(_.uniq(contentIds)),
        this.service.file.info.getDetailObjectByIds(_.uniq(fileIds)),
        this.service.folder.info.getDetailObjectByIds(_.uniq(folderIds)),
        this.service.application.getDetailObjectByIds(_.uniq(applicationIds)),
        this.service.user.getUserBaseObjectByIds(userIds),
      ]);

      let dynamicList: DynamicItem[] = [];
      operationResult.list.forEach((log) => {
        log.category.versionId &&
          (log.category.version = versionObject[log.category.versionId]?.version || '');
        log.category.contentId &&
          (log.category.contentName = contentObject[log.category.contentId]?.title || '');
        log.category.fileId && (log.category.fileName = fileObject[log.category.fileId]?.name || '');
        log.category.folderId && (log.category.folderName = folderObject[log.category.folderId]?.name || '');
        log.category.applicationId &&
          (log.category.applicationName = appObject[log.category.applicationId]?.name || '');

        const actionArr = log.action.split('_');
        const actionTypeArr = log.actionType.split('_');
        dynamicList.push(
          Object.assign({}, log, {
            dataType: {
              scope: actionArr[0] || '',
              type: actionTypeArr[1] || '',
              action: actionTypeArr[0] || '',
            },
            creator: userObject[log.operator] || {},
          }) as DynamicItem,
        );
      });

      return Response.success(
        {
          pageInfo: {
            page: params.page,
            size: params.size,
            total: operationResult.count,
          },
          data: dynamicList,
        },
        1140201,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getWorkspaceDynamicListFailed, 3140201);
    }
  }
}
