import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { ContentChangeReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class GetContentChanges extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get changed content information under the application
   * response the last data create time value to client
   * if the request timestamp is less ten minute day, then reset to 600000
   * @param  {ContentChangeReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Get('/changes')
  @OpenAPI({
    summary: i18n.sw.getContentChangeList,
    description: '',
    tags: ['Content'],
    operationId: 'get-content-change-list',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@QueryParams() params: ContentChangeReq): Promise<ResData<Content>> {
    try {
      let lastTimeStamp = params.timestamp || 0;
      const TEN_MINUTE = 600000;
      const ONE_DAY = 86400000;

      // default query max ten minute data
      if (params.timestamp <= 0) {
        lastTimeStamp = Date.now() - TEN_MINUTE; // ten minute before
      } else if (params.timestamp < Date.now() - ONE_DAY) {
        lastTimeStamp = Date.now() - ONE_DAY; // one day before
      }

      // Get all content data that has changed
      let { logChangeObject, lastDataTime } = await this.service.log.getChangesContentList({
        applicationId: params.applicationId,
        timestamp: lastTimeStamp,
      });

      return Response.success(
        { contents: logChangeObject, timestamp: lastDataTime || lastTimeStamp },
        1160101,
      );
    } catch (err) {
      return Response.error(err, i18n.content.getContentChangesFailed, 3160101);
    }
  }
}
