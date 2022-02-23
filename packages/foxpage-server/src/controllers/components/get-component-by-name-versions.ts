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

      let components: Component[] = [];
      for (const content of <any[]>contentList) {
        if (!content.package) {
          content.package = {};
        }

        // Exclude non-specified types of component data
        if (params.type && params.type.length > 0 && params.type.indexOf(content.package?.type) === -1) {
          continue;
        }

        let componentIds = this.service.content.component.getComponentResourceIds(
          _.map(contentList, (content) => content?.package as Component),
        );

        const dependenciesIdVersions = this.service.component.getComponentEditorAndDependends([
          content?.package as Component,
        ]);

        const dependencies = await this.service.component.getComponentDetailByIdVersion(
          dependenciesIdVersions,
        );

        const dependComponentIds = this.service.content.component.getComponentResourceIds(
          _.map(_.toArray(dependencies), 'content'),
        );
        componentIds = componentIds.concat(dependComponentIds);

        // The default setting, you need to replace it from other returned data later
        content.package.isLive = true;
        content.package.components = [];

        const [resourceObject, contentAllParents] = await Promise.all([
          this.service.content.resource.getResourceContentByIds(componentIds),
          this.service.content.list.getContentAllParents(componentIds),
        ]);

        const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
        const contentResource = this.service.content.info.getContentResourceTypeInfo(
          appResource,
          contentAllParents,
        );

        content.package.resource = this.service.version.component.assignResourceToComponent(
          content?.package?.resource || {},
          resourceObject,
          { contentResource },
        );

        // Attach the resource details of the dependent component to the component
        const dependenciesList = _.toArray(dependencies);
        if (dependenciesList.length > 0) {
          const fileContentObject = await this.service.file.list.getContentFileByIds(
            _.map(dependenciesList, 'contentId'),
          );

          // Append the name of the dependency to dependencies
          this.service.component.addNameToEditorAndDepends([content.package], fileContentObject);

          dependenciesList.forEach((depend) => {
            depend.content.resource = this.service.version.component.assignResourceToComponent(
              depend?.content?.resource || {},
              resourceObject,
              { contentResource },
            );
          });

          for (const depend of dependenciesList) {
            if (params.type?.indexOf(fileContentObject?.[depend.contentId]?.type) !== -1) {
              content.package.components.push(
                Object.assign(
                  {
                    name: fileContentObject?.[depend.contentId]?.name || '',
                    id: depend.contentId,
                    versionId: depend.id,
                    version: depend.version || '',
                  },
                  depend?.content || {},
                ) as Component,
              );
            }
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
