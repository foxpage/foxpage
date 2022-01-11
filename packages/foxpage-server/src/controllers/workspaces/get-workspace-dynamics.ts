import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Log } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { FoxCtx, PageData, ResData } from '../../types/index-types';
import { DynamicListRes, WorkspaceDynamicListReq } from '../../types/validates/log-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

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
  ): Promise<ResData<PageData<Log>>> {
    try {
      this.service.folder.info.setPageSize(params);

      const creator = ctx.userInfo.id;
      if (!creator) {
        return Response.warning(i18n.user.invalidUser);
      }

      // Default time range is last 7 days
      if (!params.startTime || !params.endTime) {
        params.startTime = new Date().getTime() - 7 * 86400000;
        params.endTime = new Date().getTime();
      }

      const operationResult = await this.service.log.getUserOperationList(
        Object.assign({ operator: creator, action: LOG.REQUEST }, params),
      );

      // Get operation data base info, include app name
      let dataIds: string[] = [];
      let applicationIds: string[] = [];
      operationResult.list.forEach((data) => {
        data.content?.id && dataIds.push(data.content.id);
        data.content?.applicationId && applicationIds.push(data.content?.applicationId);
      });

      if (dataIds.length > 0) {
        const [dataInfoObject, appObject] = await Promise.all([
          this.service.log.getLogDataInfo(dataIds),
          this.service.application.getDetailObjectByIds(_.uniq(applicationIds)),
        ]);

        operationResult.list.forEach((log) => {
          log.content.name =
            dataInfoObject[log.content.id]?.name || dataInfoObject[log.content.id]?.title || '';
          log.content.dataLevel = this.service.log.checkDataIdType(log.content.id).type || '';
          log.content.applicationName = appObject[<string>log.content?.applicationId]?.name || '';
        });
      }

      return Response.success({
        pageInfo: {
          page: params.page,
          size: params.size,
          total: operationResult.count,
        },
        data: operationResult.list,
      });
    } catch (err) {
      return Response.error(err, i18n.page.getWorkspaceDynamicListFailed);
    }
  }
}
