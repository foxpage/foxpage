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

@JsonController('variables')
export class GetVariableBuildDetail extends BaseController {
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
    tags: ['Variable'],
    operationId: 'get-variable-build-version',
  })
  @ResponseSchema(AppContentListRes)
  async index(@QueryParams() params: PageBuildVersionReq): Promise<ResData<ContentVersion>> {
    try {
      const versionNumber = await this.service.version.number.getLatestVersionNumber(params.id);
      let contentVersion = await this.service.version.info.getDetail({ contentId: params.id, versionNumber });

      // Get relation information
      let relations: Record<string, any[]> = {};
      if (contentVersion?.content?.relation) {
        const relationObject = await this.service.version.relation.getVersionRelations(
          { [contentVersion.contentId]: contentVersion },
          false,
        );

        relations = await this.service.relation.formatRelationResponse(relationObject);
      }

      return Response.success(Object.assign({ relations: relations }, contentVersion || {}));
    } catch (err) {
      return Response.error(err, i18n.variable.getAppVariableFailed);
    }
  }
}
