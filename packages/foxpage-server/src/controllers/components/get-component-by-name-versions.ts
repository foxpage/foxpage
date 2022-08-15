import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { Component } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { NameVersionPackage } from '../../types/content-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppComponentsRes, AppNameVersionPackagesReq } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class GetAppComponentListByNameVersion extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the component content of the specified name and version under the application,
   * response format:
   * {
   *   name,
   *   version,
   *   package:{
   *    name,version,type,...
   *   }
   * }:
   *    The name and version of the first layer are the data in the request parameters,
   *    and the name and version in the package are the actual data of the specific content.
   *    type refers to the type of page，eg. component
   * @param  {AppNameVersionPackagesReq} params
   * @returns {NameVersionPackage[]}
   */
  @Post('/version-infos')
  @OpenAPI({
    summary: i18n.sw.getAppNameVersionPackages,
    description: '',
    tags: ['Component'],
    operationId: 'get-app-name-version-packages',
  })
  @ResponseSchema(AppComponentsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppNameVersionPackagesReq,
  ): Promise<ResData<NameVersionPackage[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      // Get the information of the specified component and the specified version
      let contentList: NameVersionPackage[] = [];
      contentList = await this.service.content.component.getAppComponentByNameVersion({
        applicationId: params.applicationId,
        contentNameVersion: params.nameVersions,
        type: TYPE.COMPONENT,
      });

      let contentPackags: Component[] = [];
      for (const content of <any[]>contentList) {
        if (params.type && params.type.length > 0 && params.type.indexOf(content.package?.type) === -1) {
          continue;
        }
        
        contentPackags.push(content?.package as Component);
      }
      
      let componentIds = this.service.content.component.getComponentResourceIds(contentPackags);
      const dependenciesIdVersions = this.service.component.getComponentEditorAndDependends(contentPackags);
      const dependencies = await this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions);
      const dependenciesList = _.toArray(dependencies);
      const dependComponentIds = this.service.content.component.getComponentResourceIds(
        _.map(dependenciesList, 'content'),
      );
      componentIds = componentIds.concat(dependComponentIds);

      const [resourceObject, contentAllParents] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
      ]);

      const [appResource, fileContentObject] = await Promise.all([
        this.service.application.getAppResourceFromContent(contentAllParents),
        this.service.file.list.getContentFileByIds(_.map(dependenciesList, 'contentId')),
      ]);

      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      dependenciesList.forEach((depend) => {
        depend.content.resource = this.service.version.component.assignResourceToComponent(
          depend?.content?.resource || {},
          resourceObject,
          { contentResource },
        );
      });
      const dependenceObject = _.keyBy(dependenciesList, 'contentId');

      let components: Component[] = [];
      for (const content of <any[]>contentList) {
        if (!content.package) {
          content.package = {};
        }

        // Exclude non-specified types of component data
        if (params.type && params.type.length > 0 && params.type.indexOf(content.package?.type) === -1) {
          continue;
        }

        // The default setting, you need to replace it from other returned data later
        content.package.isLive = true;
        content.package.components = [];
        content.package.resource = this.service.version.component.assignResourceToComponent(
          content?.package?.resource || {},
          resourceObject,
          { contentResource },
        );

        const editorDependences = _.concat(
          content.package.resource?.['editor-entry'] || [],
          content.package.resource?.dependencies || [],
        );

        // Attach the resource details of the dependent component to the component
        if (editorDependences.length > 0) {
          // Append the name of the dependency to dependencies
          this.service.component.addNameToEditorAndDepends([content.package], fileContentObject);
          for (const editorDepend of editorDependences) {
            content.package.components.push(
              Object.assign(
                {
                  name: fileContentObject?.[editorDepend.id]?.name || '',
                  id: editorDepend.id,
                  versionId:  dependenceObject[editorDepend.id]?.id || '',
                  version:  dependenceObject[editorDepend.id]?.version || '',
                },
                dependenceObject[editorDepend.id]?.content || {},
              ) as Component,
            );
          }
        }

        content.package.schema = undefined;

        components.push(content);
      }

      return Response.success(components, 1110401);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentListFailed, 3110401);
    }
  }
}
