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
export class GetAppComponentInfoListByNameVersion extends BaseController {
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
   *    name,version,...
   *   }
   * }:
   *    The name and version of the first layer are the data in the request parameters,
   *    and the name and version in the package are the actual data of the specific content.
   *    type refers to the type of page，eg. component
   * @param  {AppNameVersionPackagesReq} params
   * @returns {NameVersionPackage[]}
   */
  @Post('/version-list-infos')
  @OpenAPI({
    summary: i18n.sw.getAppNameVersionPackages,
    description: '',
    tags: ['Component'],
    operationId: 'get-component-info-name-versions',
  })
  @ResponseSchema(AppComponentsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppNameVersionPackagesReq,
  ): Promise<ResData<NameVersionPackage[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      // Get the information of the specified component and the specified version
      let contentPackageList: NameVersionPackage[] =
        await this.service.content.component.getAppComponentByNameVersion({
          applicationId: params.applicationId,
          contentNameVersion: params.nameVersions,
          type: params.type || [],
        });
      let contentIds: string[] = [];
      let liveContentIds: string[] = [];
      let contentObject: Record<string, any> = {};
      let contentList: NameVersionPackage[] = [];

      contentPackageList.map((content) => {
        if (content.package?.id) {
          contentIds.push(content.package.id);
          contentObject[content.package.id] = content.package;
          contentList.push(content);
        } else if ((content.package as any)?.contentId) {
          contentIds.push((content.package as any)?.contentI);
          liveContentIds.push((content.package as any)?.contentId);
        }
      });

      if (liveContentIds.length > 0) {
        const liveContentList = await this.service.content.component.getComponentVersionLiveDetails({
          applicationId: params.applicationId,
          type: TYPE.COMPONENT,
          contentIds: liveContentIds as string[],
        });
        contentList = contentList.concat(liveContentList);
      }

      let contentPackages: Component[] = [];
      for (const content of <any[]>contentList) {
        if (
          params.type &&
          params.type.length > 0 &&
          params.type.indexOf(contentObject[content.package?.id]?.type) === -1
        ) {
          continue;
        }

        contentPackages.push(content?.package as Component);
      }

      let componentIds = this.service.content.component.getComponentResourceIds(contentPackages);
      const dependenciesIdVersions = this.service.component.getComponentEditorAndDependence(contentPackages, [
        'dependencies',
        'editor-entry',
      ]);
      const [dependencies, contentData] = await Promise.all([
        this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions),
        this.service.content.list.getDetailByIds(contentIds),
      ]);
      const contentLiveIds = _.pull(_.map(contentData, 'liveVersionId'), '') as string[];
      const dependenciesList = _.toArray(dependencies);
      const dependComponentIds = this.service.content.component.getComponentResourceIds(
        _.map(dependenciesList, 'content'),
      );
      componentIds = componentIds.concat(dependComponentIds);

      const [resourceObject, contentAllParents, contentLiveVersionList] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
        this.service.version.list.getDetailByIds(contentLiveIds),
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
      const contentLiveVersionObject = _.keyBy(contentLiveVersionList, 'contentId');

      let components: Component[] = [];
      for (const content of <any[]>contentList) {
        if (!content.package) {
          content.package = {};
        }

        // Exclude non-specified types of component data
        if (
          params.type &&
          params.type.length > 0 &&
          params.type.indexOf(contentObject[content.package?.id]?.type) === -1
        ) {
          continue;
        }

        // The default setting, you need to replace it from other returned data later
        content.package.isLive =
          contentObject[content.package?.id]?.version ===
          contentLiveVersionObject[content.package?.id]?.version;
        content.package.name = content.name || '';
        content.package.type = contentObject[content.package?.id]?.type;
        content.package.components = [];
        content.package.resource = this.service.version.component.assignResourceToComponent(
          content?.package?.resource || {},
          resourceObject,
          { contentResource },
        );

        const componentDepend = _.concat(
          content.package.resource?.dependencies || [],
          content.package.resource?.['editor-entry'] || [],
        );

        // Attach the resource details of the dependent component to the component
        if (componentDepend.length > 0) {
          // Append the name of the dependency to dependencies
          this.service.component.addNameToEditorAndDepends([content.package], fileContentObject);
          for (const depend of componentDepend) {
            content.package.components.push(
              Object.assign(
                {
                  name: fileContentObject?.[depend.id]?.name || '',
                  id: depend.id,
                  versionId: dependenceObject[depend.id]?.id || '',
                  version: dependenceObject[depend.id]?.version || '',
                },
                dependenceObject[depend.id]?.content || {},
              ) as Component,
            );
          }
        }

        content.package.schema = '';

        components.push(content);
      }

      return Response.success(components, 1110401);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentListFailed, 3110401);
    }
  }
}
