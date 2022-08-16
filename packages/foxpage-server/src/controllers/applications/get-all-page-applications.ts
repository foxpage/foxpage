import 'reflect-metadata';

import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { GetApplicationListRes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { AllAppListReq, AppListRes } from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications-all-searchs')
export class GetAllApplicationPageList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get a pagination list of applications in all organizations
   * @param  {AllAppListReq} params
   * @returns {AppInfo}
   */
  @Get('')
  @OpenAPI({
    summary: i18n.sw.allAppList,
    description: '',
    tags: ['Application'],
    operationId: 'get-all-application-list',
  })
  @ResponseSchema(AppListRes)
  async index(@QueryParams() params: AllAppListReq): Promise<ResData<GetApplicationListRes>> {
    params.search = params && params.search ? params.search : '';

    try {
      this.service.application.setPageSize(params);
      const result = await this.service.application.getPageListWithOrgInfo(params);

      return Response.success(result, 1030301);
    } catch (err) {
      return Response.error(err, i18n.app.listError, 3030301);
    }
  }
}
