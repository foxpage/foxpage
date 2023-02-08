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

@JsonController('')
export class GetPageBuildVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the build version details of the specified page content,
   * and return the details of the relation and the details of the component
   * 1, Get the latest version of the page, if the version [does not exist/not base/deleted],
   *    add a new version (created on the basis of the latest valid version)
   * 2, Get the Live information of the template if page api and that the page depends on
   * 3, Get the components of the page/template
   * 4, get the editor of the components in 3 and the dependent components
   * 5, get the details of the components in 3 and 4
   * 6, Get the component's resource id list
   * 7, Get resource details by resource ID
   * 8, Get all the relation information details of the page through the page details
   * 9, encapsulate the returned relation list into {templates:[],variables:[]...} format
   * 10, Replace the resource ID on the page with resource details
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('pages/build-versions')
  @Get('templates/build-versions')
  @Get('blocks/build-versions')
  @OpenAPI({
    summary: i18n.sw.getPageBuildVersion,
    description: '',
    tags: ['Page'],
    operationId: 'get-page-build-version',
  })
  @ResponseSchema(PageBuildVersionRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      const apiType = this.getRoutePath(ctx.request.url);

      // Get the latest version of the page
      const versionDetail = await this.service.version.info.getMaxContentVersionDetail(params.id, {
        ctx,
        createNew: true,
      });

      // Get the live information of the template that the page depends on
      let templateVersion: Partial<ContentVersion> = {};
      if (apiType === TYPE.PAGE) {
        templateVersion = await this.service.version.info.getTemplateDetailFromPage(versionDetail);
      }

      let versionPromise: any[] = [];
      versionPromise[0] = this.service.version.info.getPageVersionInfo(versionDetail, {
        applicationId: params.applicationId,
      });
      if (apiType === TYPE.PAGE) {
        versionPromise[1] = this.service.version.info.getPageVersionInfo(templateVersion as ContentVersion, {
          applicationId: params.applicationId,
          isLive: true,
        });
      }

      const [versionInfo, templateVersionInfo] = await Promise.all(versionPromise);
      await this.service.version.info.runTransaction(ctx.transactions);

      // add mock and extension to template
      if (versionInfo.relations.templates && versionInfo.relations.templates[0]) {
        versionInfo.relations.templates[0] = _.merge(
          {},
          versionInfo.relations.templates[0],
          templateVersionInfo?.mockObject[versionInfo.relations.templates[0].id] || {},
        );
      }

      // Splicing return result
      versionDetail.content.extension = versionInfo.mockObject[params.id]?.extension || {};
      versionDetail.content.dslVersion = versionDetail.dslVersion || DSL_VERSION;
      const mockRelations = versionInfo.mockObject[params.id]?.relations || {};
      const mockTemplateRelations =
        templateVersionInfo?.mockObject[templateVersion.contentId as string]?.relations || {};
      versionInfo.relations = this.service.version.relation.moveMockRelations(
        versionInfo.relations,
        mockRelations,
      );
      versionInfo.relations = this.service.version.relation.moveMockRelations(
        versionInfo.relations,
        mockTemplateRelations,
      );

      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: versionInfo.relations || {},
        mock: versionInfo.mockObject[params.id]?.mock || {},
        components: _.concat(versionInfo.componentList, templateVersionInfo?.componentList || []),
      });

      return Response.success(pageBuildVersion, 1050401);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3050401);
    }
  }
}
