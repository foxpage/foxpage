import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { ComponentContentInfo } from '../../types/component-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppComponentsReq, AppComponentsRes } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

@JsonController('components')
export class GetAppComponentListInfos extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the live version details of the components under the application
   *
   * Note: Pay attention to the difference between distinction and /live-versions
   * @param  {AppPackagesReq} params
   * @returns {NameVersionPackage[]}
   */
  @Post('/live-version-infos')
  @OpenAPI({
    summary: i18n.sw.getAppComponentLiveVersionInfo,
    description: '/components',
    tags: ['Component'],
    operationId: 'get-application-components-live-version-info',
  })
  @ResponseSchema(AppComponentsRes)
  async index(
    @Ctx() ctx: FoxCtx,
    @Body() params: AppComponentsReq,
  ): Promise<ResData<ComponentContentInfo[]>> {
    try {
      ctx.logAttr = Object.assign(ctx.logAttr, { method: METHOD.GET });

      const contentList = await this.service.content.component.getComponentVersionLiveDetails({
        applicationId: params.applicationId,
        type: (params.type as FileTypes[]) || TYPE.COMPONENT,
        contentIds: params.componentIds,
      });

      const contentFileObject = await this.service.file.list.getContentFileByIds(
        _.map(contentList, (content) => content.package?.id || ''),
      );

      // TODO Need to consider optimization component data time, efficiency issues; processing the returned structure
      let components: ComponentContentInfo[] = [];
      for (let content of contentList) {
        const componentCell = (content.package || {}) as ComponentContentInfo & {
          components: ComponentContentInfo[];
        };
        let componentIds = this.service.content.component.getComponentResourceIds([componentCell]);
        const dependenciesIdVersions = this.service.component.getComponentEditorAndDependends([
          content.package as ComponentContentInfo,
        ]);
        // TODO Obtain dependent components, need to be optimized for unified acquisition
        const [dependencies, fileContentObject] = await Promise.all([
          this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions),
          this.service.file.list.getContentFileByIds(_.map(dependenciesIdVersions, 'id')),
        ]);
        const dependComponentIds = this.service.content.component.getComponentResourceIds(
          _.map(_.toArray(dependencies), 'content'),
        );
        componentIds = componentIds.concat(dependComponentIds);
        const [resourceObject, contentAllParents] = await Promise.all([
          this.service.content.resource.getResourceContentByIds(componentIds),
          this.service.content.list.getContentAllParents(componentIds),
        ]);

        const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
        const contentResource = this.service.content.info.getContentResourceTypeInfo(
          appResource,
          contentAllParents,
        );

        componentCell.resource = this.service.version.component.assignResourceToComponent(
          componentCell.resource || {},
          resourceObject,
          { contentResource },
        );

        componentCell.type = contentFileObject[componentCell.id]?.type || '';
        componentCell.name = content.name;
        componentCell.version = <string>content.version;
        componentCell.components = [];

        // Append the component name in edit-entry
        this.service.component.addNameToEditorAndDepends([componentCell], fileContentObject);

        // Attach the resource details of the dependent component to the component
        const dependenciesList = _.toArray(dependencies);
        if (dependenciesList.length > 0) {
          const fileObject = await this.service.file.list.getContentFileByIds(
            _.map(dependenciesList, 'contentId'),
          );

          dependenciesList.forEach((depend) => {
            depend.content.resource = this.service.version.component.assignResourceToComponent(
              depend?.content?.resource || {},
              resourceObject,
              { contentResource },
            );
          });
          componentCell.components = dependenciesList.map((depend) => {
            return Object.assign(
              { name: fileObject?.[depend.contentId]?.name || '', versionId: depend.id },
              depend?.content || {},
            ) as ComponentContentInfo;
          });
        }

        // Guarantee to return id and name fields
        componentCell && components.push(componentCell);
      }

      return Response.success(components, 1110701);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentFailed, 3110701);
    }
  }
}
