import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { AppWithFolder } from '../../types/app-types';
import { ResData } from '../../types/index-types';
import { AppDetailReq, AppDetailWithFolderRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetAppDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get application details, including default folder information under the application
   * @param  {AppDetailReq} params
   * @returns {AppWithFolder} Promise
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.getAppDetail,
    description: '',
    tags: ['Application'],
    operationId: 'application-detail',
  })
  @ResponseSchema(AppDetailWithFolderRes)
  async index(@QueryParams() params: AppDetailReq): Promise<ResData<AppWithFolder>> {
    try {
      const appDetail = await this.service.application.getAppDetailWithFolder(params.applicationId);

      return Response.success(appDetail, 1030201);
    } catch (err) {
      return Response.error(err, i18n.org.getAppDetailFailed, 3030201);
    }
  }
}
