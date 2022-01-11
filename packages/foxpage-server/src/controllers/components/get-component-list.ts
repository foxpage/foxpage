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

      const contentList = await this.service.content.component.getComponentVersionLiveDetails({
        applicationId: params.applicationId,
        type: (params.type as FileTypes[]) || TYPE.COMPONENT,
        contentIds: params.componentIds || [],
      });

      // TODO Need to consider multiple components to obtain data; handle the returned structure
      const contentIds = _.pull(
        _.map(contentList, (content) => content?.package?.id),
        '',
        undefined,
      );
      const contentFileObject = await this.service.file.list.getContentFileByIds(<string[]>contentIds);

      let components: ComponentContentInfo[] = [];
      for (let content of <any[]>contentList) {
        // Exclude non-specified type of component data, and dependent information cannot appear non-specified component data
        if (params.type && params.type.indexOf(contentFileObject[content?.package?.id]?.type) === -1) {
          continue;
        }

        const componentCell = (content.package || {}) as ComponentContentInfo & {
          components: ComponentContentInfo[];
          isLive?: boolean;
        };
        let componentIds = this.service.content.component.getComponentResourceIds([componentCell]);
        const dependenciesIdVersions = this.service.component.getComponentEditorAndDependends([
          componentCell,
        ]);

        const dependencies = await this.service.component.getComponentDetailByIdVersion(
          dependenciesIdVersions,
        );

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

        componentCell.type = 'component';
        componentCell.name = content.name;
        componentCell.version = <string>content.version;
        componentCell.components = [];
        // The default setting, you need to replace it from other returned data later
        componentCell.isLive = true;

        // Attach the resource details of the dependent component to the component
        const dependenciesList = _.toArray(dependencies);
        if (dependenciesList.length > 0) {
          const fileContentObject = await this.service.file.list.getContentFileByIds(
            _.map(dependenciesList, 'contentId'),
          );

          // Append the name of the dependency to dependencies
          this.service.component.addNameToEditorAndDepends([componentCell], fileContentObject);
          dependenciesList.forEach((depend) => {
            this.service.component.addNameToEditorAndDepends([depend.content], fileContentObject);
            depend.content.resource = this.service.version.component.assignResourceToComponent(
              depend?.content?.resource || {},
              resourceObject,
              { contentResource },
            );
          });

          for (const depend of dependenciesList) {
            if (
              !params.type ||
              params.type.length === 0 ||
              params.type.indexOf(fileContentObject?.[depend.contentId]?.type) !== -1
            ) {
              componentCell.components.push(
                Object.assign(
                  {
                    name: fileContentObject?.[depend.contentId]?.name || '',
                    id: depend.contentId,
                    versionId: depend.id,
                    version: depend.version || '',
                  },
                  depend?.content || {},
                ) as ComponentContentInfo,
              );
            }
          }
        }

        // Guarantee to return id and name fields
        componentCell && components.push(componentCell);
      }

      return Response.success(components);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentFailed);
    }
  }
}
