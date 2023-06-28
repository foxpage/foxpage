import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { LOG } from '../../../config/constant';
import { ResData } from '../../types/index-types';
import { LogContent } from '../../types/log-types';
import { UserBase } from '../../types/user-types';
import { ContentVersionLogRes, GetContentVersionLogs } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface VersionLogItem {
  id: string;
  contentId: string;
  version: string;
  versionNumber: number;
  action: string;
  content: LogContent[];
  creator: UserBase;
  createTime: Date;
  updateTime: Date;
}

@JsonController('contents')
export class GetContentVersionChangeLogs extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the content version change logs
   * @param  {GetTypeItemVersionReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Get('/version-logs')
  @OpenAPI({
    summary: i18n.sw.getContentVersionChangeLogs,
    description: '',
    tags: ['Page'],
    operationId: 'get-content-version-change-logs',
  })
  @ResponseSchema(ContentVersionLogRes)
  async index(@QueryParams() params: GetContentVersionLogs): Promise<ResData<VersionLogItem[]>> {
    const { applicationId = '', contentId = '', versionId = '' } = params;

    try {
      const [contentDetail, versionDetail] = await Promise.all([
        this.service.content.info.getDetailById(contentId),
        this.service.version.info.getDetailById(versionId),
      ]);

      if (
        this.notValid(contentDetail) ||
        this.notValid(versionDetail) ||
        versionDetail.contentId !== contentId ||
        contentDetail.applicationId !== applicationId
      ) {
        return Response.warning(i18n.content.invalidVersionId, 2052501);
      }

      const [logList, contentLogList] = await Promise.all([
        this.service.log.find({ 'content.id': versionId, action: { $in: [LOG.PUBLISH, LOG.LIVE] } }),
        this.service.contentLog.find({ 'category.versionId': versionId }),
      ]);

      const userIds = _.concat(_.map(logList, 'operator'), _.map(contentLogList, 'creator'));
      const userObject = await this.service.user.getUserBaseObjectByIds(userIds);

      let versionChangeLogs: VersionLogItem[] = [];
      logList.forEach((log: any) => {
        versionChangeLogs.push({
          id: versionId,
          contentId,
          version: versionDetail.version,
          versionNumber: versionDetail.versionNumber,
          action: log.action,
          content: [],
          creator: userObject[log.operator] || {},
          createTime: log.createTime as Date,
          updateTime: log.updateTime as Date,
        });
      });

      contentLogList.forEach((log) => {
        versionChangeLogs.push({
          id: versionId,
          contentId,
          version: versionDetail.version,
          versionNumber: versionDetail.versionNumber,
          action: log.action,
          content: log.content || [],
          creator: userObject[log.creator] || {},
          createTime: log.createTime as Date,
          updateTime: log.updateTime as Date,
        });
      });

      return Response.success(_.orderBy(versionChangeLogs, ['createTime'], ['desc']), 1052501);
    } catch (err) {
      return Response.error(err, i18n.page.getPageVersionsFailed, 3052501);
    }
  }
}
