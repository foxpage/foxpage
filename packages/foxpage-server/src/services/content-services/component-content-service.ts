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

import { COMPONENT_TYPE, PRE, TYPE, VERSION } from '../../../config/constant';
import * as Model from '../../models';
import { ComponentContentInfo, ComponentInfo, ComponentNameVersion } from '../../types/component-types';
import {
  AppNameVersion,
  AppTypeContent,
  ComponentRecursive,
  ContentVersionString,
  NameVersion,
  NameVersionContent,
  NameVersionPackage,
} from '../../types/content-types';
import { FoxCtx, TRecord } from '../../types/index-types';
import { generationId } from '../../utils/tools';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ComponentContentService extends BaseService<Content> {
  private static _instance: ComponentContentService;

  constructor() {
    super(Model.content);
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
    // Get component name infos
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
    for (const schema of schemas || []) {
      if (schema.type === COMPONENT_TYPE.REACT_COMPONENT) {
        schema.name && componentInfo.push({ name: schema.name, version: schema.version || '' });
      }

      if (schema.children && schema.children.length > 0) {
        const children = this.getComponentInfoRecursive(schema.children);
        componentInfo = componentInfo.concat(children);
      }
    }

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

    // replace reference component
    fileList.forEach((file) => {
      if (file.tags && file.tags.length > 0) {
        const referTag = _.find(file.tags, { type: 'reference' });
        referTag?.reference && (file.id = referTag.reference.id || '');
      }
    });

    // Get the corresponding contentIds under the file
    let contentVersionString: ContentVersionString[] = [];
    let contentLiveIdObject: Record<string, string> = {};
    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));
    const contentNameObject: Record<string, Content> = _.keyBy(contentList, 'title');
    componentInfos.forEach((component) => {
      if (contentNameObject[component.name] && component.version) {
        contentVersionString.push({
          contentId: contentNameObject[component.name].id,
          version: component.version,
        });
      } else if (contentNameObject[component.name]) {
        contentLiveIdObject[contentNameObject[component.name].id] =
          contentNameObject[component.name]?.liveVersionId || '';
      }
    });

    // Get content containing different versions of the same component
    const versionList = await Promise.all([
      Service.version.list.getVersionListChunk(_.values(contentLiveIdObject)),
      Service.version.list.getContentInfoByIdAndVersion(contentVersionString),
    ]);

    const contentIdObject: Record<string, Content> = _.keyBy(contentList, 'id');
    const componentList: Component[] = _.flatten(versionList).map((version) => {
      return Object.assign(
        {
          name: contentIdObject[version.contentId].title,
          version:
            showLiveVersion || version.id !== contentLiveIdObject[version.contentId] ? version.version : '',
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
  getComponentResourceIds(componentList: Component[], types?: string[]): string[] {
    let componentIds: string[] = [];
    componentList.forEach((component) => {
      let item = <Record<string, string>>component?.resource?.entry || {};
      if (types && types.length > 0) {
        item = _.pick(item, types || []);
      }

      _.forIn(item, (value) => {
        if (_.isString(value)) {
          componentIds.push(value);
        } else if ((value as any)?.contentId) {
          componentIds.push((value as any).contentId);
        }
      });
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
    let nameVersions = _.cloneDeep(params.contentNameVersion || []);
    const nameVersionObject = _.keyBy(_.cloneDeep(params.contentNameVersion || []), 'name');

    // Get the fileIds of the specified name of the specified application
    const fileList = await Service.file.info.getFileIdByNames({
      applicationId: params.applicationId,
      type: _.isString(params.type) ? [params.type] : [],
      fileNames: _.keys(nameVersionObject),
    });

    let canaryFileIds: string[] = [];
    // replace reference component, reference component do not return canary version
    fileList.forEach((file) => {
      const referTag = _.find(file.tags, { type: 'reference' });
      if (referTag?.reference) {
        file.id = referTag.reference.id || '';
      } else if (params.isCanary) {
        canaryFileIds.push(file.id);
      }
    });

    // Get content information through fileId
    const contentList = await Service.content.file.getContentByFileIds(_.map(fileList, 'id'));

    // set canary to to nameVersions variable
    if (params.isCanary) {
      const needGetCanaryContentList = _.filter(contentList, (content) => {
        return canaryFileIds.indexOf(content.fileId) !== -1;
      });
      nameVersions = await this.setCanaryVersion(nameVersions, needGetCanaryContentList);
    }

    // Get the version details corresponding to the specified name version
    const contentVersionList = await Service.version.list.getContentVersionListByNameVersion(
      contentList,
      nameVersions,
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

    nameVersions.forEach((content) => {
      contentId = contentNameObject[content.name]?.id || '';
      version = content.version || '';

      if (contentVersionObject[contentId + version]) {
        componentContentList.push(
          Object.assign(
            {
              name: content.name,
              version: nameVersionObject[content.name]?.version || '',
            },
            {
              package: Object.assign({}, contentVersionObject[contentId + version].content, {
                name: content.name,
                version: contentVersionObject[contentId + version].version,
                type: fileObject[contentIdObject[contentId].fileId]?.type,
              }),
            },
          ) as NameVersionPackage,
        );
      } else {
        componentContentList.push(
          Object.assign(
            { package: { contentId: contentNameObject[content.name]?.id || '' } as any },
            content,
          ) as NameVersionPackage,
        );
      }
    });

    return componentContentList;
  }

  async setCanaryVersion(nameVersions: NameVersion[], contentList: Content[]): Promise<NameVersion[]> {
    const contentIds = _.map(contentList, 'id');
    const canaryVersionList = await Service.version.list.find(
      {
        contentId: { $in: contentIds },
        deleted: false,
        status: VERSION.STATUS_CANARY,
      },
      'contentId version',
    );
    const contentObject = _.keyBy(contentList, 'title');
    let canaryVersionObject: Record<string, ContentVersion> = {};
    canaryVersionList.forEach((version) => {
      !canaryVersionObject[version.contentId] && (canaryVersionObject[version.contentId] = version);
    });
    nameVersions.forEach((item) => {
      if (canaryVersionObject[contentObject[item.name]?.id]) {
        item.version = canaryVersionObject[contentObject[item.name].id].version || '';
      }
    });

    return nameVersions;
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
      contentInfo = await Service.content.list.getAppContentList(params);
    } else {
      // Check whether contentIds is under the specified appId
      contentInfo = await Service.content.list.getContentInfo({
        applicationId: params.applicationId,
        contentIds,
      });
    }

    // Get live details
    const contentVersionList: ContentVersion[] = await Service.version.list.getVersionListChunk(
      _.map(contentInfo, 'liveVersionId') as string[],
    );

    const contentObject = _.keyBy(contentInfo, 'id');

    // Data returned by splicing
    return contentVersionList.map((contentVersion) => {
      return {
        name: contentObject[contentVersion.contentId].title,
        version: contentVersion.version,
        package: contentVersion.content as ComponentDSL,
        deprecated: (<any>contentObject[contentVersion.contentId]).deprecated,
      };
    });
  }

  /**
   * Clone package content
   * @param targetFileId
   * @param sourceFileId
   * @param options
   */
  async cloneContent(targetFileId: string, sourceFileId: string, options: { ctx: FoxCtx }): Promise<void> {
    const contentList = await Service.content.file.getContentByFileIds([sourceFileId]);
    const contentInfo = contentList[0] || {};
    const contentId = contentInfo?.id || '';
    if (contentId) {
      const contentDetail = Service.content.info.create(
        {
          id: generationId(PRE.CONTENT),
          title: _.trim(contentInfo?.title) || '',
          fileId: targetFileId,
          creator: options.ctx.userInfo.id,
        },
        options,
      );

      const versionInfo = await Service.version.info.getDetail({
        contentId,
        versionNumber: contentInfo?.liveVersionNumber,
      });
      Service.version.info.create(
        {
          id: generationId(PRE.CONTENT_VERSION),
          contentId: contentDetail.id,
          version: versionInfo.version || '0.0.1',
          versionNumber: versionInfo.versionNumber || 1,
          content: Object.assign({ id: contentDetail.id }, versionInfo.content || {}),
          creator: options.ctx.userInfo.id,
        },
        options,
      );
    }
  }
}
