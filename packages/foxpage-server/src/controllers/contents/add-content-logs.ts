import 'reflect-metadata';

import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Content } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { FoxCtx, ResData } from '../../types/index-types';
import { AddContentLogsReq, ContentDetailRes } from '../../types/validates/content-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('contents')
export class AddContentLogs extends BaseController {
  constructor() {
    super();
  }

  /**
   * Create content operation logs, include structure node logs
   * @param  {AddContentLogsReq} params
   * @param  {Header} headers
   * @returns Content
   */
  @Post('/logs')
  @OpenAPI({
    summary: i18n.sw.addContentLogs,
    description: '',
    tags: ['Content'],
    operationId: 'add-content-logs',
  })
  @ResponseSchema(ContentDetailRes)
  async index(@Ctx() ctx: FoxCtx, @Body() params: AddContentLogsReq): Promise<ResData<Content>> {
    const { applicationId = '', contentId = '' } = params;
    let { versionId = '' } = params;
    const userId = ctx.userInfo.id;

    try {
      if (!applicationId || !contentId || !userId) {
        return Response.warning('Invalid application id, content id or user info', 2161001);
      } else if (!versionId) {
        const versionDetail = await this.service.version.info.getMaxBaseContentVersionDetail(contentId);
        versionId = versionDetail?.id || '';
      }

      if (params.logs && params.logs.length > 0) {
        ctx.transactions.push(
          this.service.contentLog.createLogQuery(params.logs, { contentId, versionId, userId }),
          this.service.appContentLog.createLogQuery(params.logs, { contentId, versionId, userId }),
        );

        await this.service.contentLog.runTransaction(ctx.transactions);
      }

      return Response.success({}, 1161001);
    } catch (err) {
      return Response.error(err, '', 3161001);
    }
  }
}
