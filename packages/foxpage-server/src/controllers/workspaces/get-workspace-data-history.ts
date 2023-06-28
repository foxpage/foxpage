import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Log } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { PageData, ResData } from '../../types/index-types';
import { RequestDetailsRes, WorkspaceHistoryReq } from '../../types/validates/log-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('workspaces')
export class GetWorkspaceRequestDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the special data history
   *
   * @param  {WorkspaceRequestReq} params
   * @returns {LogRequestDetail}
   */
  @Get('/history')
  @OpenAPI({
    summary: i18n.sw.getWorkspaceDataHistory,
    description: '',
    tags: ['Workspace'],
    operationId: 'get-workspace-data-history',
  })
  @ResponseSchema(RequestDetailsRes)
  async index(@QueryParams() params: WorkspaceHistoryReq): Promise<ResData<PageData<Log>>> {
    try {
      this.service.log.setPageSize(params);
      const dataHistory = await this.service.log.getDataHistory(params);

      return Response.success(
        {
          pageInfo: {
            page: params.page,
            size: params.size,
            total: dataHistory.count,
          },
          data: dataHistory.list,
        },
        1140101,
      );
    } catch (err) {
      return Response.error(err, i18n.page.getWorkspaceDataHistoryFailed, 3140101);
    }
  }
}
