import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { DSL_VERSION } from '../../../config/constant';
import { PageBuildVersion } from '../../types/content-types';
import { ResData } from '../../types/index-types';
import { PageBuildVersionReq, PageBuildVersionRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class GetPageLiveVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get page live version detail
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('/live-version')
  @OpenAPI({
    summary: i18n.sw.getPageLiveVersion,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-live-version',
  })
  @ResponseSchema(PageBuildVersionRes)
  async index (
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      // Get the page content detail
      const contentDetail = await this.service.content.info.getDetailById(params.id);
      const liveVersionNumber = contentDetail?.liveVersionNumber || 0;

      if (liveVersionNumber === 0) {
        return Response.success({}, 1052101);
      }

      const versionDetail = await this.service.version.info.getDetail({ contentId: params.id, versionNumber: liveVersionNumber });
      const templateVersion: Partial<ContentVersion> = await this.service.version.info.getTemplateDetailFromPage(
        params.applicationId,
        versionDetail,
      );

      const [versionInfo, templateVersionInfo] = await Promise.all([
        this.service.version.info.getPageVersionInfo(versionDetail, { applicationId: params.applicationId }),
        this.service.version.info.getPageVersionInfo(templateVersion as ContentVersion, { applicationId: params.applicationId, isLive: true }),
      ]);

      // add mock and extension to template
      if (versionInfo.relations.templates && versionInfo.relations.templates[0]) {
        versionInfo.relations.templates[0] = _.merge(
          {},
          versionInfo.relations.templates[0],
          templateVersionInfo.mockObject[versionInfo.relations.templates[0].id] || {}
        );
      }

      // Splicing return result
      versionDetail.content.extension = versionInfo.mockObject[params.id]?.extension || {};
      versionDetail.content.dslVersion = versionDetail.dslVersion || DSL_VERSION;

      const mockRelations = versionInfo.mockObject[params.id]?.relations || {};
      const mockTemplateRelations = templateVersionInfo.mockObject[templateVersion.contentId as string]?.relations || {};
      versionInfo.relations = this.service.version.relation.moveMockRelations(versionInfo.relations, mockRelations);
      versionInfo.relations = this.service.version.relation.moveMockRelations(versionInfo.relations, mockTemplateRelations);

      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: versionInfo.relations || {},
        mock: versionInfo.mockObject[params.id]?.mock || {},
        components: _.concat(versionInfo.componentList, templateVersionInfo.componentList),
      });

      return Response.success(pageBuildVersion, 1052102);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3052101);
    }
  }
}
