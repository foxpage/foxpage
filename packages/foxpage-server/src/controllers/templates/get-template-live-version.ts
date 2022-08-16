import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { DSL_VERSION } from '../../../config/constant';
import { PageBuildVersion } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { PageBuildVersionReq, PageBuildVersionRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class GetTemplateLiveVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the specified template content,
   * and return the details of the relation and the details of the component.
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('/live-version')
  @OpenAPI({
    summary: i18n.sw.getTemplateLiveVersion,
    description: '',
    tags: ['Template'],
    operationId: 'get-template-live-version',
  })
  @ResponseSchema(PageBuildVersionRes)
  async index (
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      // Get the template content detail
      const contentDetail = await this.service.content.info.getDetailById(params.id);
      const liveVersionNumber = contentDetail?.liveVersionNumber || 0;

      if (liveVersionNumber === 0) {
        return Response.success({}, 1071901);
      }

      const versionDetail = await this.service.version.info.getDetail({ contentId: params.id, versionNumber: liveVersionNumber });
      const versionInfo = await this.service.version.info.getPageVersionInfo(versionDetail, { applicationId: params.applicationId });

      // Splicing return result
      versionDetail.content.extension = versionInfo.mockObject[params.id]?.extension || {};
      versionDetail.content.dslVersion = versionDetail.dslVersion || DSL_VERSION;
      
      const mockRelations = versionInfo.mockObject[params.id]?.relations || {};
      versionInfo.relations = this.service.version.relation.moveMockRelations(versionInfo.relations, mockRelations);

      const pageLiveVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: versionInfo.relations || {},
        mock: versionInfo.mockObject[params.id]?.mock || {},
        components: versionInfo.componentList,
      });

      return Response.success(pageLiveVersion, 1071902);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3071901);
    }
  }
}
