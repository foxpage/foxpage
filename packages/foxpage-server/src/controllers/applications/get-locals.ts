import 'reflect-metadata';

import _ from 'lodash';
import {
  Get,
  JsonController,
  // QueryParams
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { config, i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import {
  // AppLocalesReq,
  AppLocalesRes,
} from '../../types/validates/app-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('applications')
export class GetApplicationLocales extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get all optional locales of the application
   * @param  {AppListReq} params
   * @returns {AppInfo}
   */
  @Get('/locales')
  @OpenAPI({
    summary: i18n.sw.getAppLocales,
    description: '',
    tags: ['Application'],
    operationId: 'get-application-locales',
  })
  @ResponseSchema(AppLocalesRes)
  async index(): // @QueryParams() params: AppLocalesReq
  Promise<ResData<string[]>> {
    try {
      // console.log(params);
      return Response.success(_.uniq(config?.allLocales || []), 1030601);
    } catch (err) {
      return Response.error(err, i18n.app.getLocalesError, 3030601);
    }
  }
}
