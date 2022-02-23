import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Component } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { VERSION } from '../../../config/constant';
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
  async index(
    @Ctx() ctx: FoxCtx,
    @QueryParams() params: PageBuildVersionReq,
  ): Promise<ResData<PageBuildVersion>> {
    try {
      // Get the largest version number of content
      let versionDetail = await this.service.version.info.getMaxContentVersionDetail(params.id, {
        ctx,
        createNew: true,
      });

      // The latest version is released or deleted, then create a new version
      if (!versionDetail || versionDetail.status !== VERSION.STATUS_BASE || versionDetail.deleted) {
        versionDetail = await this.service.version.info.createNewContentVersion(params.id, { ctx });
      }

      let componentList: Component[] = await this.service.content.component.getComponentsFromDSL(
        params.applicationId,
        versionDetail.content?.schemas || [],
      );

      // Get the component information in the editor in the component
      const editorComponentList = await this.service.content.component.getEditorDetailFromComponent(
        params.applicationId,
        componentList,
      );

      componentList = componentList.concat(editorComponentList);
      const componentIds = this.service.content.component.getComponentResourceIds(componentList);

      // Get component resource information, get relation information
      const [resourceObject, relationObject, contentAllParents] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.version.relation.getVersionRelations(
          { [versionDetail.contentId]: versionDetail },
          false,
        ),
        this.service.content.list.getContentAllParents(componentIds),
      ]);

      // Place the relation details on the follower node
      // and set it to the structure of {"templates": [], "variables":[],...}
      const [relations, appResource] = await Promise.all([
        this.service.relation.formatRelationResponse(relationObject),
        this.service.application.getAppResourceFromContent(contentAllParents),
      ]);

      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      // Add resource to component
      componentList = this.service.content.component.replaceComponentResourceIdWithContent(
        componentList,
        resourceObject,
        contentResource,
      );

      await this.service.version.info.runTransaction(ctx.transactions);

      // Splicing return result
      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations,
        components: componentList,
      });

      return Response.success(pageBuildVersion, 1070501);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3070501);
    }
  }
}
