import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ContentDetailRes, GetContentStructureLogsReq } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class GetContentChangeItemIdLogs extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get content changed item id logs, include structure, variable, condition...
   * if version id is invalid, then get the base version
   * @param  {GetContentLogsReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Get('/change-item-logs')
  @OpenAPI({
    summary: i18n.sw.getContentLogs,
    description: '',
    tags: ['Content'],
    operationId: 'get-content-change-item-id-logs',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: GetContentStructureLogsReq): Promise<ResData<Record<string, string[]>>> {
    const { applicationId = '', contentId = '' } = params;
    let { versionId = '' } = params;

    try {
      if (!applicationId || !contentId) {
        return Response.warning(i18n.content.invalidAppOrContentId, 2161201);
      } else if (!versionId) {
        const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(contentId);
        versionId = versionDetail?.id || '';
      }

      if (!versionId) {
        return Response.success({}, 1161202);
      }

      let queryParams: Record<string, any> = {
        'category.contentId': contentId,
        'category.versionId': versionId,
      };

      const logList = await this.service.contentLog.find(queryParams, '-_id -category._id');
      let itemIdObject: Record<string, string[]> = {};
      logList.forEach((log) => {
        (log.content || []).forEach((item) => {
          if (!itemIdObject[item.type]) {
            itemIdObject[item.type] = [item.id];
          } else if (itemIdObject[item.type].indexOf(item.id) === -1) {
            itemIdObject[item.type].push(item.id);
          }
        });
      });

      return Response.success(itemIdObject, 1161201);
    } catch (err) {
      return Response.error(err, i18n.content.getPageContentLogFailed, 3161201);
    }
  }
}
