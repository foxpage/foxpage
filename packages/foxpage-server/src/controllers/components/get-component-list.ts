import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import metric from '../../third-parties/metric';
import { ComponentContentInfo } from '../../types/component-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppComponentsReq, AppComponentsRes } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

type ComponentCell = ComponentContentInfo & {
  components: ComponentContentInfo[];
  isLive?: boolean;
};

@JsonController('components')
export class GetAppComponentList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the components under the application
   * @param  {AppPackagesReq} params
   * @returns {NameVersionPackage[]}
   */
  @Post('/live-versions')
  @OpenAPI({
    summary: i18n.sw.getAppComponent,
    description: '/components',
    tags: ['Component'],
    operationId: 'get-application-components-live-version',
  })
  @ResponseSchema(AppComponentsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppComponentsReq,
  ): Promise<ResData<ComponentContentInfo[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      metric.time('component-live-version');
      const contentList = await this.service.content.component.getComponentVersionLiveDetails({
        applicationId: params.applicationId,
        type: (params.type as FileTypes[]) || TYPE.COMPONENT,
        contentIds: params.componentIds || [],
        loadOnIgnite: params.loadOnIgnite,
      });
      metric.block('getComponentVersionLiveDetails', 'component-live-version');

      const contentIds = _.pull(
        _.map(contentList, (content) => content?.package?.id),
        '',
        undefined,
      );

      const contentFileObject = await this.service.file.list.getContentFileByIds(<string[]>contentIds);
      const componentCells = [];
      for (let content of <any[]>contentList) {
        // Exclude non-specified type of component data, and dependent information cannot appear non-specified component data
        if (params.type && params.type.indexOf(contentFileObject[content?.package?.id]?.type) === -1) {
          continue;
        }

        componentCells.push((content.package || {}) as ComponentCell);
      }

      let componentIds = this.service.content.component.getComponentResourceIds(componentCells, [
        'browser',
        'node',
        'css',
      ]);
      const dependenciesIdVersions = this.service.component.getComponentEditorAndDependence(componentCells, [
        'dependencies',
      ]);
      let dependencies = await this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions);
      const dependenceList = _.toArray(dependencies);
      const dependComponentIds = this.service.content.component.getComponentResourceIds(
        _.map(dependenceList, 'content'),
        ['browser', 'node', 'css'],
      );

      componentIds = componentIds.concat(dependComponentIds);

      metric.time('component-resource');
      const [resourceObject, contentAllParents, dependFileContentObject] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
        this.service.file.list.getContentFileByIds(_.map(dependenceList, 'contentId')),
      ]);
      metric.block('getComponentResources', 'component-resource');

      const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
      const contentResource = this.service.content.info.getContentResourceTypeInfo(
        appResource,
        contentAllParents,
      );

      this.service.component.addNameToEditorAndDepends(componentCells, dependFileContentObject);
      dependenceList.forEach((depend) => {
        depend.content.resource = this.service.version.component.assignResourceToComponent(
          depend?.content?.resource || {},
          resourceObject,
          { contentResource },
        );
      });

      let dependenceObject = _.keyBy(dependenceList, 'contentId');

      let components: ComponentContentInfo[] = [];
      for (let content of <any[]>contentList) {
        // Exclude non-specified type of component data, and dependent information cannot appear non-specified component data
        if (params.type && params.type.indexOf(contentFileObject[content?.package?.id]?.type) === -1) {
          continue;
        }

        const componentCell = (content.package || {}) as ComponentCell;
        componentCell.resource = this.service.version.component.assignResourceToComponent(
          componentCell.resource || {},
          resourceObject,
          { contentResource },
        );

        componentCell.resource['editor-entry'] = [];
        componentCell.type = contentFileObject[content?.package?.id]?.type;
        componentCell.name = content.name;
        componentCell.version = <string>content.version;
        componentCell.isLive = true;
        componentCell.schema = '';
        componentCell.components = [];

        if (componentCell.resource.dependencies && componentCell.resource.dependencies.length > 0) {
          componentCell.resource.dependencies.forEach((depend) => {
            componentCell.components.push(
              Object.assign(
                {
                  id: depend.id,
                  name: dependFileContentObject?.[depend.id]?.name || '',
                  versionId: dependenceObject[depend.id]?.id,
                  version: dependenceObject[depend.id]?.version,
                },
                dependenceObject[depend.id]?.content || {},
                { schema: {} },
              ) as ComponentContentInfo,
            );
          });
        }

        // Guarantee to return id and name fields
        componentCell && components.push(componentCell);
      }

      // send metric
      components.length === 0 && metric.empty(ctx.request.url, params.applicationId);

      return Response.success(components, 1110801);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentFailed, 3110801);
    }
  }
}
