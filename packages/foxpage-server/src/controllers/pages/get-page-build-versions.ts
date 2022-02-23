import 'reflect-metadata';

import _ from 'lodash';
import { Ctx, Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Component, ContentVersion } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { ComponentContentInfo } from '../../types/component-types';
import { PageBuildVersion } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { PageBuildVersionReq, PageBuildVersionRes } from '../../types/validates/page-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('pages')
export class GetPageBuildVersionDetail extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the build version details of the specified page content,
   * and return the details of the relation and the details of the component
   * 1, Get the latest version of the page, if the version [does not exist/not base/deleted],
   *    add a new version (created on the basis of the latest valid version)
   * 2, Get the Live information of the template that the page depends on
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
  @Get('/build-versions')
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
      // Get the latest version of the page
      const versionDetail = await this.service.version.info.getMaxContentVersionDetail(params.id, {
        ctx,
        createNew: true,
      });

      // Get the live information of the template that the page depends on
      const templateVersion: Partial<ContentVersion> = await this.service.version.info.getTemplateDetailFromPage(
        params.applicationId,
        versionDetail,
        { isLive: false },
      );

      // Get the components of the page/template
      const versionSchemas = versionDetail?.content?.schemas || [];
      const templateSchemas = templateVersion?.content?.schemas || [];
      const componentDetailList: Component[][] = await Promise.all([
        this.service.content.component.getComponentsFromDSL(params.applicationId, versionSchemas),
        this.service.content.component.getComponentsFromDSL(params.applicationId, templateSchemas),
      ]);
      let componentList = _.flatten(componentDetailList);

      // Get the editor component of the component and the dependent components
      const editorComponentList = await this.service.content.component.getEditorDetailFromComponent(
        params.applicationId,
        componentList,
      );
      componentList = componentList.concat(editorComponentList);
      const idVersionList = this.service.component.getEditorAndDependenceFromComponent(componentList);
      const dependencies = await this.service.component.getComponentDetailByIdVersion(idVersionList);
      componentList = componentList.concat(_.map(dependencies, (depend) => depend?.content || {}));
      const componentIds = this.service.content.component.getComponentResourceIds(componentList);

      // Through the page details, get all the relation information details of the page
      const versionRelations = {
        [versionDetail.contentId]: versionDetail,
        [templateVersion?.contentId || '']: templateVersion as ContentVersion,
      };

      const [resourceObject, relationObject, componentFileObject, contentAllParents] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.version.relation.getVersionRelations(versionRelations, false),
        this.service.file.list.getContentFileByIds(_.map(componentList, 'id')),
        this.service.content.list.getContentAllParents(componentIds),
      ]);

      const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      // Add the resource to the component, add the editor-entry and the name of the dependencies in the component
      componentList = this.service.component.addNameToEditorAndDepends(
        componentList as ComponentContentInfo[],
        componentFileObject,
      );
      componentList = this.service.content.component.replaceComponentResourceIdWithContent(
        componentList,
        resourceObject,
        contentResource,
      );

      // Encapsulate the returned relation list into {templates:[],variables:[]...} format
      const relations = await this.service.relation.formatRelationResponse(relationObject);

      await this.service.version.info.runTransaction(ctx.transactions);

      // Splicing return result
      const pageBuildVersion: PageBuildVersion = Object.assign({}, versionDetail, {
        relations: relations || {},
        components: componentList,
      });

      return Response.success(pageBuildVersion, 1050401);
    } catch (err) {
      return Response.error(err, i18n.page.getPageBuildVersionFailed, 3050401);
    }
  }
}
