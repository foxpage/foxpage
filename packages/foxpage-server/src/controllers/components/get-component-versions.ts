import 'reflect-metadata';

import _ from 'lodash';
import { Get, JsonController, QueryParams } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { FileTypes } from '@foxpage/foxpage-server-types';

import { i18n } from '../../../app.config';
import { TYPE } from '../../../config/constant';
import { ComponentContentInfo } from '../../types/component-types';
import { ResData } from '../../types/index-types';
import { AppComponentsRes, ComponentContentVersionReq } from '../../types/validates/component-validate-types';
import * as Response from '../../utils/response';
import { BaseController } from '../base-controller';

type ComponentCell = ComponentContentInfo & {
  components: ComponentContentInfo[];
  isLive?: boolean;
};

@JsonController('components')
export class GetComponentVersionList extends BaseController {
  constructor() {
    super();
  }

  /**
   * Get the version detail list of component by content id or component name
   * @param  {ComponentContentVersionReq} params
   * @returns {NameVersionPackage[]}
   */
  @Get('/version-list')
  @OpenAPI({
    summary: i18n.sw.getAppComponent,
    description: '/components',
    tags: ['Component'],
    operationId: 'get-application-components-version-list',
  })
  @ResponseSchema(AppComponentsRes)
  async index(@QueryParams() params: ComponentContentVersionReq): Promise<ResData<ComponentContentInfo[]>> {
    try {
      if (!params.name && !params.id) {
        return Response.warning(i18n.component.invalidIdOrName, 2112301);
      }

      // get component content id by name
      if (!params.id) {
        const componentDetail = await this.service.file.info.getDetail({
          name: params.name,
          applicationId: params.applicationId,
          type: { $in: [TYPE.COMPONENT, TYPE.SYSCOMPONENT] as FileTypes[] },
          deleted: false,
        });

        if (this.notValid(componentDetail)) {
          return Response.success([], 1112302);
        }

        const referenceTag = this.service.content.tag.getTagsByKeys(componentDetail.tags || [], [
          'reference',
        ]);
        const fileId = referenceTag.reference?.id || componentDetail.id;
        const fileContent = await this.service.content.file.getContentByFileIds([fileId]);
        params.id = fileContent[0]?.id || '';

        if (!params.id) {
          return Response.success([], 1112303);
        }
      }

      const [versionList, contentDetail] = await Promise.all([
        this.service.version.list.find({ contentId: params.id, deleted: false }),
        this.service.content.info.getDetailById(params.id),
      ]);

      const componentCells: ComponentCell[] = _.map(versionList, 'content');
      let componentIds = this.service.content.component.getComponentResourceIds(componentCells);
      const dependenciesIdVersions = this.service.component.getComponentEditorAndDependence(componentCells, [
        'editor-entry',
        'dependencies',
      ]);
      let dependencies = await this.service.component.getComponentDetailByIdVersion(dependenciesIdVersions);
      const dependenceList = _.toArray(dependencies);
      const dependComponentIds = this.service.content.component.getComponentResourceIds(
        _.map(dependenceList, 'content'),
      );

      componentIds = componentIds.concat(dependComponentIds);
      const [resourceObject, contentAllParents, dependFileContentObject] = await Promise.all([
        this.service.content.resource.getResourceContentByIds(componentIds),
        this.service.content.list.getContentAllParents(componentIds),
        this.service.file.list.getContentFileByIds(_.map(dependenceList, 'contentId')),
      ]);

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
      for (const version of versionList) {
        const componentCell = (version.content || {}) as ComponentCell;
        componentCell.resource = this.service.version.component.assignResourceToComponent(
          componentCell.resource || {},
          resourceObject,
          { contentResource },
        );

        componentCell.type = contentDetail?.type as string;
        componentCell.name = contentDetail?.title;
        componentCell.version = <string>version.version;
        componentCell.isLive = version.id === contentDetail?.liveVersionId;
        componentCell.schema = '';
        componentCell.components = [];
        const componentDepend = _.concat(
          componentCell.resource.dependencies,
          componentCell.resource['editor-entry'],
        );
        if (componentDepend.length > 0) {
          componentDepend.forEach((depend) => {
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

        componentCell && components.push(componentCell);
      }

      return Response.success(components, 1112301);
    } catch (err) {
      return Response.error(err, i18n.component.getAppComponentFailed, 3112301);
    }
  }
}
