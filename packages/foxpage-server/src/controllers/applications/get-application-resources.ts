import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AppResource } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { AppDetailReq, AppResourceDetailRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetApplicationResources extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the resource details of the specified application
   * @param  {AppListReq} params
   * @returns {AppInfo}
   */
  @Get('/resources')
  @OpenAPI({
    summary: i18n.sw.getAppResources,
    description: '',
    tags: ['Application'],
    operationId: 'get-application-resources',
  })
  @ResponseSchema(AppResourceDetailRes)
  async index(@QueryParams() params: AppDetailReq): Promise<ResData<AppResource[]>> {
    try {
      const appDetail = await this.service.application.getDetailById(params.applicationId);

      return Response.success(appDetail?.resources || [], 1030401);
    } catch (err) {
      return Response.error(err, i18n.app.getAppResourceError, 3030401);
    }
  }
}
