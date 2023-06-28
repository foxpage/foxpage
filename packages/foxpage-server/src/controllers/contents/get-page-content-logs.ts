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
        return Response.warning(i18n.content.invalidAppOrContentId, 2162801);
      } else if (!versionId) {
        const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(contentId);
        versionId = versionDetail?.id || '';
      }

      let queryParams: Record<string, any> = {
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

      const structureIds = _(logList).map('content').flatten().map('id').uniq().value();
      let deleteQueryParams: Record<string, any>[] = [
        {
          $match: {
            'category.contentId': contentId,
            'category.versionId': versionId,
            'content.id': { $in: structureIds },
          },
        },
        { $sort: { createTime: 1 } },
        { $group: { _id: '$content.id', lastData: { $last: '$$ROOT' } } },
        { $match: { 'lastData.action': '13' } }, // delete log status
        { $project: { 'lastData.id': 1 } },
      ];
      const lastDeleteData = await this.service.contentLog.aggregate(deleteQueryParams);
      const reversibleLogIds: string[] = _.map(lastDeleteData, 'lastData.id');

      // get user info
      const userIds = _.uniq(_.map(logList, 'creator'));
      const userObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let logInfoList: LogInfoItem[] = [];
      for (const log of logList) {
        logInfoList.push(
          Object.assign({}, _.omit(log, ['creator']), {
            creator: userObject[log.creator] || {},
            reversible: log.action === '13' && reversibleLogIds.indexOf(log.id) !== -1,
          }),
        );
      }

      return Response.success(
        {
          pageInfo: this.paging(logCount, pageSize),
          data: logInfoList,
        },
        1162801,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getPageContentLogFailed, 3162801);
    }
  }
}
