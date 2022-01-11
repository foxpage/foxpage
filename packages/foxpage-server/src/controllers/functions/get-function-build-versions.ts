import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ResData } from '../../types/index-types';
import { AppContentListRes, PageBuildVersionReq } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('functions')
export class GetFunctionBuildDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the build details of the specified variable content
   * @param  {PageBuildVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('/build-versions')
  @OpenAPI({
    summary: i18n.sw.getVariableBuildDetail,
    description: '',
    tags: ['Function'],
    operationId: 'get-variable-build-version',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: PageBuildVersionReq): Promise<ResData<ContentVersion>> {
    try {
      const versionNumber = await this.service.version.number.getLatestVersionNumber(params.id);
      const contentVersion = await this.service.version.info.getDetail({
        contentId: params.id,
        versionNumber,
      });

      return Response.success(contentVersion);
    } catch (err) {
      return Response.error(err, i18n.variable.getAppVariableFailed);
    }
  }
}
