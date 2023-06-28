import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Log } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { RequestDetailsRes, WorkspaceRequestReq } from '../../types/validates/log-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface LogRequestDetail {
  request: Partial<Log>;
  details: Log[];
}

@JsonController('workspaces')
export class GetWorkspaceRequestDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the special request details
   *
   * @param  {WorkspaceRequestReq} params
   * @returns {LogRequestDetail}
   */
  @Get('/requests')
  @OpenAPI({
    summary: i18n.sw.getWorkspaceRequestDetail,
    description: '',
    tags: ['Workspace'],
    operationId: 'get-workspace-request-detail',
  })
  @ResponseSchema(RequestDetailsRes)
  async index(@QueryParams() params: WorkspaceRequestReq): Promise<ResData<LogRequestDetail>> {
    try {
      let logList = await this.service.log.getListByTransactionId(params.transactionId);

      // filter result, remove action value is `content_tag`, `file_tag` and `meta_update` data
      let logData: LogRequestDetail = { request: {}, details: [] };
      logList.forEach((log) => {
        if (log.action === LOG.REQUEST) {
          logData.request = log;
        } else if ([LOG.CONTENT_TAG, LOG.FILE_TAG, LOG.META_UPDATE].indexOf(log.action) === -1) {
          logData.details.push(log);
        }
      });

      return Response.success(logData, 1140501);
    } catch (err) {
      return Response.error(err, i18n.page.getWorkspaceRequestDetailFailed, 3140501);
    }
  }
}
