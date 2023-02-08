import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentLog } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, GetContentLogsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface LogInfoItem extends Omit<ContentLog, 'creator'> {
  creator: Record<string, string>;
}

@JsonController('contents')
export class GetPageContentLogs extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get content los by content or structure id
   * @param  {GetContentLogsReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Get('/logs')
  @OpenAPI({
    summary: i18n.sw.getContentLogs,
    description: '',
    tags: ['Content'],
    operationId: 'get-content-logs',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: GetContentLogsReq): Promise<ResData<LogInfoItem>> {
    const { applicationId = '', contentId = '', structureId = '' } = params;
    let { versionId = '' } = params;

    try {
      const pageSize = this.service.contentLog.setPageSize(params);

      if (!applicationId || !contentId) {
        return Response.warning(i18n.content.invalidAppOrContentId, 2161001);
      } else if (!versionId) {
        const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(contentId);
        versionId = versionDetail?.id || '';
      }

      let queryParams: Record<string, string> = {
        'category.contentId': contentId,
        'category.versionId': versionId,
      };
      structureId && (queryParams['content.id'] = structureId);

      const [logCount, logList] = await Promise.all([
        this.service.contentLog.getCount(queryParams),
        this.service.contentLog.find(queryParams, '-_id -category._id', {
          sort: { createTime: -1 },
          skip: (pageSize.page - 1) * pageSize.size,
          limit: pageSize.size,
        }),
      ]);

      // get user info
      const userIds = _.uniq(_.map(logList, 'creator'));
      const userObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let logInfoList: LogInfoItem[] = [];
      for (const log of logList) {
        logInfoList.push(
          Object.assign({}, _.omit(log, ['creator']), { creator: userObject[log.creator] || {} }),
        );
      }

      return Response.success(
        {
          pageInfo: this.paging(logCount, pageSize),
          data: logInfoList,
        },
        1161101,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getPageContentLogFailed, 3161101);
    }
  }
}
