import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Put } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { LOG, TYPE } from '../../../config/constant';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppIDReq } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class SetApplicationStatus extends BaseController {
  constructor() {
    super();
  }

  /**
   * Set application AppIDReq status, default set delete to true
   * @param  {UpdateAppReq} params
   * @returns Application
   */
  @Put('/status')
  @OpenAPI({
    summary: i18n.sw.setAppStatus,
    description: '',
    tags: ['Application'],
    operationId: 'set-application-status',
  })
  async index(@Ctx() ctx: FoxCtx, @Body() params: AppIDReq): Promise<ResData<string>> {
    try {
      // Check the validity of the application
      let appDetail = await this.service.application.getDetailById(params.applicationId);
      if (!appDetail || appDetail.deleted) {
        return Response.warning(i18n.app.invalidAppId, 2031401);
      }

      // Permission check
      const hasAuth = await this.service.auth.application(params.applicationId, { ctx, mask: 1 });
      if (!hasAuth) {
        return Response.accessDeny(i18n.system.accessDeny, 4031401);
      }

      await this.service.application.updateDetail(params.applicationId, { deleted: true });
      this.service.userLog.addLogItem(appDetail, {
        ctx,
        actions: [LOG.DELETE, '', TYPE.APPLICATION],
        category: { applicationId: appDetail.id },
      });

      return Response.success(i18n.app.setAppStatusSuccess, 1031401);
    } catch (err) {
      return Response.error(err, i18n.app.setAppStatusFailed, 3031401);
    }
  }
}
