import 'reflect-metadata';

import _ from 'lodash';
import { Body, Ctx, JsonController, Post } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { METHOD, TYPE } from '../../../config/constant';
import { ComponentCategory,ComponentContentInfo } from '../../types/component-types';
import { FoxCtx, ResData } from '../../types/index-types';
import { AppComponentsReq, AppComponentsRes } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

interface CompontentCells extends ComponentContentInfo {
  components: ComponentContentInfo[];
  category?: ComponentCategory;
}

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

      // Get App all components live info
      const contentList = await this.service.content.component.getComponentVersionLiveDetails({
        applicationId: params.applicationId,
        type: (params.type as FileTypes[]) || TYPE.COMPONENT,
        contentIds: params.componentIds,
      });

      const contentFileObject = await this.service.file.list.getContentFileByIds(
        _.map(contentList, (content) => content.package?.id || ''),
        params.applicationId
      );

      let components: ComponentContentInfo[] = [];
      let componentCells: CompontentCells[] = [];
      contentList.map(content => {
        content.package && componentCells.push(content.package as CompontentCells);
      });

      let componentIds = this.service.content.component.getComponentResourceIds(componentCells);
      const dependenciesIdVersions = this.service.component.getComponentEditorAndDependends(componentCells);

      // Get component dependents editor or component
      const [dependencies, fileContentObject, appDetail] = await Promise.all([
        this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions),
        this.service.file.list.getContentFileByIds(_.map(dependenciesIdVersions, 'id'), params.applicationId),
        this.service.application.getDetailById(params.applicationId),
      ]);
      
      const dependenciesList = _.toArray(dependencies);
      const dependComponentIds = this.service.content.component.getComponentResourceIds(
        _.map(dependenciesList, 'content'),
      );

      // Get component's resource info
      componentIds = componentIds.concat(dependComponentIds);
      const [resourceObject, contentAllParents, fileObject] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds), 
        this.service.file.list.getContentFileByIds(_.map(dependenciesList, 'contentId'), params.applicationId),
      ]);

      const appResource = await this.service.application.getAppResourceFromContent(contentAllParents);
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

      const componentSettingObject = _.keyBy(appDetail.setting?.[TYPE.COMPONENT] || [], 'id');
      for (let content of contentList) {
        const componentCell = (content.package || {}) as CompontentCells;
        componentCell.type = contentFileObject[componentCell.id]?.type || '';
        componentCell.name = content.name;
        componentCell.version = <string>content.version;
        componentCell.components = [];
        componentCell.category = (
          componentSettingObject[contentFileObject[componentCell.id]?.id || '']?.category || {}
        ) as ComponentCategory;
        componentCell.resource = this.service.version.component.assignResourceToComponent(
          componentCell.resource || {},
          resourceObject,
          { contentResource },
        );

        this.service.component.addNameToEditorAndDepends([componentCell], fileContentObject);

        let dependIds = _.map(
          _.concat(componentCell.resource['editor-entry'], componentCell.resource.dependencies),
          'id'
        );

        if (dependIds.length > 0) {          
          for (const depend of dependenciesList) {
            if(dependIds.indexOf(depend.contentId) !== -1) {
              componentCell.components.push(Object.assign(
                { name: fileObject?.[depend.contentId]?.name || '', versionId: depend.id },
                depend?.content || {},
              ) as ComponentContentInfo);
              _.pull(dependIds, depend.contentId);
            }

            if (dependIds.length === 0) {
              break;
            }
          }
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
