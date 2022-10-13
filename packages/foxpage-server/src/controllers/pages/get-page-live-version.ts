import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { DSL_VERSION, TYPE } from '../../../config/constant';
import { PageBuildVersion } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { PageBuildVersionReq, PageBuildVersionRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController()
export class GetPageLiveVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get page live version detail
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('pages/live-version')
  @Get('templates/live-version')
  @Get('blocks/live-version')
  @OpenAPI({
    summary: i18n.sw.getPageLiveVersion,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-live-version',
  })
  @ResponseSchema(PageBuildVersionRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      // Get the page content detail
      const contentDetail = await this.service.content.info.getDetailById(params.id);
      const liveVersionNumber = contentDetail?.liveVersionNumber || 0;

      if (liveVersionNumber === 0) {
        return Response.success({}, 1052101);
      }

      const versionDetail = await this.service.version.info.getDetail({
        contentId: params.id,
        versionNumber: liveVersionNumber,
      });

      let templateVersion: Partial<ContentVersion> = {};
      if (apiType === TYPE.PAGE) {
        templateVersion = await this.service.version.info.getTemplateDetailFromPage(
          params.applicationId,
          versionDetail,
        );
      }

      let versionInfoPromise: any[] = [];
      versionInfoPromise[0] = this.service.version.info.getPageVersionInfo(versionDetail, {
        applicationId: params.applicationId,
      });

      if (apiType === TYPE.PAGE) {
        versionInfoPromise[1] = this.service.version.info.getPageVersionInfo(
          templateVersion as ContentVersion,
          {
            applicationId: params.applicationId,
            isLive: true,
          },
        );
      }

      const [versionInfo, templateVersionInfo] = await Promise.all(versionInfoPromise);

      // add mock and extension to template
      if (apiType === TYPE.PAGE && versionInfo.relations.templates && versionInfo.relations.templates[0]) {
        versionInfo.relations.templates[0] = _.merge(
          {},
          versionInfo.relations.templates[0],
          templateVersionInfo.mockObject[versionInfo.relations.templates[0].id] || {},
        );
      }

      // Splicing return result
      versionDetail.content.extension = versionInfo.mockObject[params.id]?.extension || {};
      versionDetail.content.dslVersion = versionDetail.dslVersion || DSL_VERSION;

      const mockRelations = versionInfo.mockObject[params.id]?.relations || {};
      versionInfo.relations = this.service.version.relation.moveMockRelations(
        versionInfo.relations,
        mockRelations,
      );

      if (apiType === TYPE.PAGE) {
        const mockTemplateRelations =
          templateVersionInfo?.mockObject[templateVersion.contentId as string]?.relations || {};
        versionInfo.relations = this.service.version.relation.moveMockRelations(
          versionInfo.relations,
          mockTemplateRelations,
        );
      }
      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: versionInfo.relations || {},
        mock: versionInfo.mockObject[params.id]?.mock || {},
        components: _.concat(versionInfo.componentList, templateVersionInfo?.componentList || []),
      });

      return Response.success(pageBuildVersion, 1052102);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3052101);
    }
  }
}
