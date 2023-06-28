import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Application, GetApplicationListRes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { AppInfo } from '../../types/app-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppListReq, AppListRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('application-searchs')
export class GetApplicationPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a pagination list of application by params type
   * data type
   * user: app that user create
   * org: app in the org
   * project: app in org or relation in org
   * user project: app in user create project
   * involve project: app in user auth project
   * @param  {AppListReq} params
   * @returns {AppInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.appList,
    description: 'apps',
    tags: ['Application'],
    operationId: 'get-application-list',
  })
  @ResponseSchema(AppListRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: AppListReq,
  ): Promise<ResData<GetApplicationListRes>> {
    params.search = params && params.search ? params.search : '';

    try {
      const pageSize = this.service.application.setPageSize(params);

      let appList: Application[] = [];
      let total: number = 0;
      !params.type && (params.type = '');

      let allAppIds: string[] = [];
      switch (params.type) {
        case '':
        case 'user':
        case 'org':
          const appPageData = await this.service.application.getPageList(
            Object.assign({}, params, { creator: params.type === TYPE.USER ? ctx.userInfo.id : '' }),
          );
          total = appPageData.total;
          appList = appPageData.appList;
          break;
        case 'project':
          const [orgAppIds, otherOrgAppIds] = await Promise.all([
            this.service.application.find({ organizationId: params.organizationId, deleted: false }, 'id'),
            this.service.folder.list.distinct('applicationId', {
              deleted: false,
              $and: [
                { 'tags.type': TYPE.PROJECT_FOLDER },
                { tags: { $elemMatch: { type: TYPE.ORGANIZATION, typeId: params.organizationId } } },
              ],
            }),
          ]);
          allAppIds = _(orgAppIds)
            .map((n) => n.id)
            .concat(otherOrgAppIds)
            .uniq()
            .value();
          total = allAppIds.length;
          break;
        case 'user_project':
          allAppIds = await this.service.folder.list.distinct('applicationId', {
            'tags.type': TYPE.PROJECT_FOLDER,
            deleted: false,
            creator: ctx.userInfo.id,
          });
          total = allAppIds.length;
          break;
        case 'involve_project':
          allAppIds = await this.service.auth.distinct('relation.applicationId', {
            targetId: ctx.userInfo.id,
            deleted: false,
            allow: true,
          });
          total = allAppIds.length;
          break;
      }

      // Obtain user name data based on app lists data
      let appUserList: AppInfo[] = [];
      if (total > 0 && appList.length === 0) {
        appList = await this.service.application.find({ id: { $in: allAppIds } }, '', {
          skip: ((pageSize.page || 1) - 1) * pageSize.size,
          limit: pageSize.size,
        });
      }

      if (appList.length > 0) {
        const userBaseObject = await this.service.user.getUserBaseObjectByIds(_.map(appList, 'creator'));
        _.orderBy(appList, ['createTime'], ['desc']).map((app) => {
          appUserList.push(
            Object.assign(_.pick(app, ['id', 'name', 'createTime', 'updateTime']), {
              creator: userBaseObject[app.creator],
            }) as AppInfo,
          );
        });
      }

      return Response.success(
        {
          pageInfo: this.paging(total, pageSize),
          data: appUserList,
        },
        1030701,
      );
    } catch (err) {
      return Response.error(err, i18n.app.listError, 3030701);
    }
  }
}
