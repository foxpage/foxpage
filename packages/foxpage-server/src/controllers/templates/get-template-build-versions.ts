import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { i18n } from '../../../app.config';
import { DSL_VERSION, VERSION } from '../../../config/constant';
import { PageBuildVersion } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { PageBuildVersionReq, PageBuildVersionRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('templates')
export class GetPageBuildVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the build version details of the specified template content,
   * and return the details of the relation and the details of the component.
   * @param  {AppContentVersionReq} params
   * @returns {PageContentData[]}
   */
  @Get('/build-versions')
  @OpenAPI({
    summary: i18n.sw.getTemplateBuildVersion,
    description: '',
    tags: ['Template'],
    operationId: 'get-template-build-version',
  })
  @ResponseSchema(PageBuildVersionRes)
  async index (
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      // Get the largest version number of content
      let versionDetail = await this.service.version.info.getMaxContentVersionDetail(params.id, { ctx, createNew: true });

      // The latest version is released or deleted, then create a new version
      if (!versionDetail || versionDetail.status !== VERSION.STATUS_BASE || versionDetail.deleted) {
        versionDetail = await this.service.version.info.createNewContentVersion(params.id, { ctx });
      }

      const versionInfo = await this.service.version.info.getPageVersionInfo(
        versionDetail,
        { applicationId: params.applicationId }
      );

      await this.service.version.info.runTransaction(ctx.transactions);

      versionDetail.content.extension = versionInfo.mockObject[params.id]?.extension || {};
      versionDetail.content.dslVersion = versionDetail.dslVersion || DSL_VERSION;
      const mockRelations = versionInfo.mockObject[params.id]?.relations || {};
      versionInfo.relations = this.service.version.relation.moveMockRelations(versionInfo.relations, mockRelations);

      // Splicing return result
      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: versionInfo.relations,
        mock: versionInfo.mockObject[params.id]?.mock || {},
        components: versionInfo.componentList,
      });

      return Response.success(pageBuildVersion, 1070501);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3070501);
    }
  }
}
