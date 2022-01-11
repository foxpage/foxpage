import _ from 'lodash';

import {
  AppResource,
  Component,
  ComponentDSL,
  Content,
  ContentVersion,
  DslSchemas,
  EditorEntry,
  ResourceType,
} from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
import { ComponentContentInfo, ComponentInfo, ComponentNameVersion } from '../../types/component-types';
import {
  AppNameVersion,
  AppTypeContent,
  ComponentRecursive,
  ContentLiveVersion,
  ContentVersionString,
  NameVersion,
  NameVersionContent,
  NameVersionPackage,
} from '../../types/content-types';
import { TRecord } from '../../types/index-types';
import { ContentServiceAbstract } from '../abstracts/content-service-abstract';
import * as Service from '../index';

export class ComponentContentService extends ContentServiceAbstract {
  private static _instance: ComponentContentService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns ContentService
   */
  public static getInstance(): ComponentContentService {
    this._instance || (this._instance = new ComponentContentService());
    return this._instance;
  }

  /**
   * Get all data information from DSL
   * @param  {applicationId} string
   * @param  {DslSchemas[]} schemas
   * @returns Promise
   */
  async getComponentsFromDSL(applicationId: string, schemas: DslSchemas[]): Promise<Component[]> {
    // 递归获取所有组件名称等信息
    const componentInfos = this.getComponentInfoRecursive(schemas);
    const componentList = await this.getComponentDetails(applicationId, componentInfos);
    return componentList;
  }

  /**
   * Recursively obtain component information of all levels in the DSL
   * @param  {DslSchemas[]} components
   * @returns NameVersion
   */
  getComponentInfoRecursive(schemas: DslSchemas[]): NameVersion[] {
    let componentInfo: NameVersion[] = [];
    schemas?.forEach((schema) => {
      schema.name && componentInfo.push({ name: schema.name, version: schema.version || '' });

      if (schema.children && schema.children.length > 0) {
        const children = this.getComponentInfoRecursive(schema.children);
        componentInfo = componentInfo.concat(children);
      }
    });

    return componentInfo;
  }

  /**
   * Get the component details under the specified application through the component name and version
   * @param  {string} applicationId
   * @param  {NameVersion[]} componentInfos
   * @returns Promise
   */
  async getComponentDetails(
    applicationId: string,
    componentInfos: NameVersion[],
    showLiveVersion: boolean = true,
  ): Promise<Component[]> {
    // Get the file corresponding to the component
    const fileList = await Service.file.info.find({
      applicationId,
      name: { $in: _.map(componentInfos, 'name') },
      deleted: false,
    });

    // Get the corresponding contentIds under the file
    let contentVersionString: ContentVersionString[] = [];
    let contentVersionNumber: ContentLiveVersion[] = [];
    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));
    const contentNameObject: Record<string, Content> = _.keyBy(contentList, 'title');
    componentInfos.forEach((component) => {
      if (contentNameObject[component.name] && component.version) {
        contentVersionString.push({
          contentId: contentNameObject[component.name].id,
          version: component.version,
        });
      } else {
        contentVersionNumber.push(_.pick(contentNameObject[component.name], ['id', 'liveVersionNumber']));
      }
    });

    // Get content containing different versions of the same component
    const versionList = await Promise.all([
      Service.version.list.getContentInfoByIdAndNumber(contentVersionNumber),
      Service.version.list.getContentInfoByIdAndVersion(contentVersionString),
    ]);

    const contentIdObject: Record<string, Content> = _.keyBy(contentList, 'id');
    const liveVersionObject: Record<string, ContentLiveVersion> = _.keyBy(contentVersionNumber, 'id');
    const componentList: Component[] = _.flatten(versionList).map((version) => {
      return Object.assign(
        {
          name: contentIdObject[version.contentId].title,
          version:
            showLiveVersion ||
            version.versionNumber !== liveVersionObject[version.contentId]?.liveVersionNumber
              ? version.version
              : '',
          type: TYPE.COMPONENT,
        },
        version.content,
      );
    });

    return componentList;
  }

  /**
   * Get the resource ids set by the component from the component list
   * @param  {ContentVersion[]} componentList
   * @returns Promise
   */
  getComponentResourceIds(componentList: Component[]): string[] {
    let componentIds: string[] = [];
    componentList.forEach((component) => {
      const item = <Record<string, string>>component?.resource?.entry || {};
      componentIds = componentIds.concat(_.pull(_.values(item), ''));
    });

    return _.filter(componentIds, (id) => _.isString(id));
  }

  /**
   * Replace the resource id in the component with the resource details
   * @param  {ContentVersion[]} componentList
   * @param  {Record<string} resourceObject
   * @param  {} object>
   * @returns ContentVersion
   */
  replaceComponentResourceIdWithContent(
    componentList: Component[],
    resourceObject: TRecord<TRecord<string>>,
    contentResource: Record<string, AppResource> = {},
  ): Component[] {
    let newComponentList: Component[] = _.cloneDeep(componentList);
    newComponentList.forEach((component) => {
      const item = <Record<string, string>>component?.resource?.entry || {};
      (Object.keys(item) as ResourceType[]).forEach((typeKey) => {
        const path = resourceObject[item[typeKey]]?.realPath || '';
        const contentId = item[typeKey] || '';

        item[typeKey] = contentId
          ? ({
              host: contentResource?.[contentId]?.detail.host || '',
              downloadHost: contentResource?.[contentId]?.detail.downloadHost || '',
              path: _.pull(path.split('/'), '').join('/'),
              contentId,
            } as any)
          : {};
      });
    });
    return newComponentList;
  }

  /**
   * Get the id of the component editor from the component details, version
   * @param  {Component[]} componentList
   * @returns string
   */
  getComponentEditors(componentList: Component[]): EditorEntry[] {
    let editorIdVersion: EditorEntry[] = [];
    componentList.forEach((component) => {
      editorIdVersion = editorIdVersion.concat(component?.resource?.['editor-entry'] || []);
    });

    return editorIdVersion;
  }

  /**
   * Get the editor information from the component, and return the component details of the editor
   * @param  {string} applicationId
   * @param  {Component[]} componentList
   * @returns Promise
   */
  async getEditorDetailFromComponent(
    applicationId: string,
    componentList: Component[],
  ): Promise<Component[]> {
    const editorIdVersion = Service.content.component.getComponentEditors(componentList);
    const editorFileObject = await Service.file.list.getContentFileByIds(_.map(editorIdVersion, 'id'));
    const editorComponentIds = _.pull(_.map(_.toArray(editorFileObject), 'id'), '');

    if (editorComponentIds.length > 0) {
      editorIdVersion.forEach((editor) => (editor.name = editorFileObject[editor.id]?.name || ''));
    }
    return Service.content.component.getComponentDetails(applicationId, editorIdVersion as NameVersion[]);
  }

  /**
   * Recursively get the details of the component,
   * Check the validity of the components
   * Check whether the component has a circular dependency
   * @param  {string} applicationId
   * @param  {NameVersion[]} componentInfos
   * @param  {Record<string} componentDependents
   * @param  {} string[]>={}
   * @returns Promise
   */
  async getComponentDetailRecursive(
    applicationId: string,
    componentInfos: NameVersion[],
    componentDependents: Record<string, string[]> = {},
  ): Promise<ComponentRecursive> {
    let componentList = await Service.version.info.getVersionDetailByFileNameVersion(
      applicationId,
      TYPE.COMPONENT,
      componentInfos,
    );

    // Check the component, whether the version is returned
    let missingComponents: NameVersion[] = [];
    const componentListObject: Record<string, NameVersionContent> = _.keyBy(
      componentList,
      (component) => component.name + component.version,
    );

    componentInfos?.forEach((component) => {
      !componentListObject[component.name + component.version] && missingComponents.push(component);
    });

    if (missingComponents.length > 0) {
      return { componentList, dependence: {}, recursiveItem: '', missingComponents };
    }

    const dependence = Service.version.component.getComponentDependsFromVersions(componentList);
    const componentDepend = Service.content.check.checkCircularDependence(componentDependents, dependence);

    let dependenceObject = componentDepend.dependencies;
    const nextDepends: NameVersion[] = _.flatten(Object.values(dependence)).map((depend) => {
      return { name: depend, version: '' };
    });
    if (!componentDepend.recursiveItem && nextDepends.length > 0) {
      const dependDependence = await this.getComponentDetailRecursive(
        applicationId,
        nextDepends,
        dependenceObject,
      );
      componentList = componentList.concat(dependDependence.componentList);
      componentDepend.recursiveItem = dependDependence.recursiveItem;
      dependenceObject = dependDependence.dependence;
      missingComponents = dependDependence.missingComponents;
    }

    componentList = _.toArray(
      _.keyBy(componentList, (component) => [component.name, component.version].join('_')),
    );

    return {
      componentList,
      dependence: dependenceObject,
      recursiveItem: componentDepend.recursiveItem,
      missingComponents,
    };
  }

  /**
   * Get the component details by name, version,
   * and return the object with the passed name_version as the key name
   * @param  {ComponentNameVersion} params
   * @returns Promise
   */
  async getComponentDetailByNameVersion(
    params: ComponentNameVersion,
  ): Promise<Record<string, ComponentInfo>> {
    const fileList = await Service.file.info.getFileIdByNames({
      applicationId: params.applicationId,
      fileNames: _.map(params.nameVersions, 'name'),
      type: params.type || [],
    });

    // Get content information through fileId, and the version details corresponding to the specified name version
    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));
    const [contentVersionList, contentFileObject] = await Promise.all([
      Service.version.list.getContentVersionListByNameVersion(contentList, params.nameVersions),
      Service.file.list.getContentFileByIds(_.map(contentList, 'id')),
    ]);

    let versionObject: Record<string, ComponentContentInfo> = {};
    const contentObject = _.keyBy(contentList, 'id');
    let nameLive: Record<string, string> = {};
    contentVersionList.forEach((version) => {
      const componentName = contentFileObject[version.contentId]?.name || '';
      const liveVersion = contentObject[version.contentId]?.liveVersionNumber || 0;
      if (componentName) {
        nameLive[componentName] = version.versionNumber === liveVersion ? version.version : '';
        versionObject[[componentName, version.version].join('_')] = Object.assign(
          {
            name: componentName,
            type: contentFileObject[version.contentId]?.type || '',
            isLive: version.versionNumber === liveVersion,
            version: version.version,
          },
          version.content || {},
        );
      }
    });

    let nameVersionDetail: Record<string, ComponentInfo> = {};
    params.nameVersions.forEach((item) => {
      const key = [item.name, item.version].join('_');
      if (item.version) {
        nameVersionDetail[key] = Object.assign(item, { content: versionObject[key] || {} });
      } else {
        nameVersionDetail[key] = Object.assign(item, {
          content: versionObject[[item.name, nameLive[item.name]].join('_')] || {},
        });
      }
    });

    return nameVersionDetail;
  }

  /**
   * Get the content version details of the component through the content name and version,
   *  the same name has different versions of data
   * Prerequisite: The content name is the same as the file name (for example: component type content),
   *  and there is only 1 content information under the file
   *
   * Get the versionNumber of the content with the version,
   *  and get the versionNumber of the live if there is no version,
   * Get content details through contentId, versionNumber
   * @param  {AppNameVersion} params
   * @returns {NameVersionPackage[]} Promise
   */
  async getAppComponentByNameVersion(params: AppNameVersion): Promise<NameVersionPackage[]> {
    // Get the fileIds of the specified name of the specified application
    const fileList = await Service.file.info.getFileIdByNames({
      applicationId: params.applicationId,
      type: params.type || '',
      fileNames: _.map(params.contentNameVersion, 'name'),
    });

    // Get content information through fileId
    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));

    // Get the version details corresponding to the specified name version
    const contentVersionList = await Service.version.list.getContentVersionListByNameVersion(
      contentList,
      params.contentNameVersion,
    );

    // Get the details corresponding to different versions of contentId,
    // including live details with contentId as the key
    const contentVersionObject = Service.version.info.mappingContentVersionInfo(
      contentList,
      contentVersionList,
    );

    // Match data
    let contentId: string = '';
    let version: string = '';
    let componentContentList: NameVersionPackage[] = [];
    const fileObject = _.keyBy(fileList, 'id');
    const contentIdObject = _.keyBy(contentList, 'id');
    const contentNameObject = _.keyBy(contentList, 'title');

    params.contentNameVersion.forEach((content) => {
      contentId = contentNameObject[content.name]?.id || '';
      version = content.version || '';

      if (contentVersionObject[contentId + version]) {
        componentContentList.push(
          Object.assign({ version }, content, {
            package: Object.assign({}, contentVersionObject[contentId + version].content, {
              name: content.name,
              version: contentVersionObject[contentId + version].version,
              type: fileObject[contentIdObject[contentId].fileId]?.type,
            }),
          }) as NameVersionPackage,
        );
      } else {
        componentContentList.push(content);
      }
    });

    return componentContentList;
  }

  /**
   * Get the live version details of the component content under the specified application,
   * and return the content version details
   * @param  {AppTypeContent} params
   * @returns {NameVersionPackage[]} Promise
   */
  async getComponentVersionLiveDetails(params: AppTypeContent): Promise<NameVersionPackage[]> {
    const contentIds = params.contentIds || [];
    let contentInfo: Content[] = [];

    // Get contentIds
    if (contentIds.length === 0) {
      contentInfo = await Service.content.list.getAppContentList(_.pick(params, ['applicationId', 'type']));
    } else {
      // Check whether contentIds is under the specified appId
      contentInfo = await Service.content.list.getDetailByIds(contentIds);
      contentInfo = _.filter(contentInfo, { deleted: false });
    }

    // Get live details
    let contentVersionList: ContentVersion[] = [];
    if (contentInfo.length > 0) {
      const contentLiveIds = contentInfo.map((content) => _.pick(content, ['id', 'liveVersionNumber']));
      contentVersionList = await Service.version.list.getContentInfoByIdAndNumber(contentLiveIds);
    }

    const contentObject = _.keyBy(contentInfo, 'id');

    // Data returned by splicing
    return contentVersionList.map((contentVersion) => {
      return Object.assign(
        { name: contentObject[contentVersion.contentId].title },
        { version: contentVersion.version, package: contentVersion.content as ComponentDSL },
      );
    });
  }
}
