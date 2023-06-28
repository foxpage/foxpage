import _ from 'lodash';
import { FoxCtx } from 'src/types/index-types';

import {
  Component,
  ComponentDSL,
  ContentVersion,
  Dependencies,
  EditorEntry,
  File,
  IdVersion,
  IdVersionNumbers,
} from '@foxpage/foxpage-server-types';

import { LOG, TAG, TYPE } from '../../config/constant';
import * as Model from '../models';
import { AppItemSearch } from '../types/app-types';
import { ComponentContentInfo } from '../types/component-types';
import { UpdateContentVersion } from '../types/content-types';

import * as Service from './index';

export class ComponentService {
  private static _instance: ComponentService;

  constructor() {}

  /**
   * Single instance
   * @returns ComponentService
   */
  public static getInstance(): ComponentService {
    this._instance || (this._instance = new ComponentService());
    return this._instance;
  }

  /**
   * Update component version details, including version number
   * @param  {UpdateContentVersion} params
   * @returns Promise
   */
  async updateVersionDetail(
    params: UpdateContentVersion,
    options: { ctx: FoxCtx; actionDataType?: string },
  ): Promise<Record<string, number | string | string[]>> {
    const versionDetail = await Service.version.info.getDetailById(params.id);
    const contentDetail = await Service.content.info.getDetailById(versionDetail.contentId || '');
    const missingFields = await Service.version.check.contentFields(contentDetail.fileId, params.content);
    if (missingFields.length > 0) {
      return { code: 1, data: missingFields }; // Check required fields
    }

    // Update
    params.content.id = versionDetail.contentId || '';
    options.ctx.transactions.push(
      Service.version.info.updateDetailQuery(params.id, {
        version: params.version,
        versionNumber: Service.version.number.createNumberFromVersion(params.version),
        content: params.content,
      }),
    );
    Service.userLog.addLogItem(versionDetail, {
      ctx: options.ctx,
      actions: [LOG.UPDATE, options.actionDataType || contentDetail.type || '', TYPE.VERSION],
      category: { versionId: params.id, contentId: versionDetail.contentId, fileId: contentDetail.fileId },
    });

    return { code: 0 };
  }

  /**
   * Get component details through id and version
   * If the component specifies the version, such as: 1.1.2, then get the version of 1.1.2
   * If the component does not specify the version or other circumstances, the live version is taken
   *
   * Recursively obtain component information that the component depends on
   *
   * Taking into account the problem of obtaining different versions of the same component,
   * and the ids are all using contentId, it is impossible to distinguish the attribution of
   * different versions of the same component in the returned results
   * So, for the time being, if there are multiple versions of the same component,
   * the details will be obtained separately
   * @param  {any[]} componentInfos The information of all acquired components is used to exclude
   * the acquired version information of the components
   * @returns Promise Returns the component details information object with contentId_version as the key
   */
  async getComponentDetailByIdVersion(
    idVersions: IdVersion[],
    componentInfos: Record<string, ContentVersion> = {},
  ): Promise<Record<string, ContentVersion>> {
    const { idNumbers = [], liveVersionIds = [] } = await this.getComponentVersionNumberFromVersion(
      idVersions,
    );

    if (idNumbers.length === 0 && liveVersionIds.length === 0) {
      return {};
    }

    const idVersionNumbers = idNumbers.map((item) => {
      return { id: item.id, liveVersionNumber: item.versionNumber };
    });

    // Get component details
    const versionList = _.flatten(
      await Promise.all([
        Service.version.list.getContentInfoByIdAndNumber(idVersionNumbers),
        Service.version.list.getVersionListChunk(liveVersionIds),
      ]),
    );
    componentInfos = Object.assign(
      componentInfos,
      _.keyBy(versionList, (version) => [version.contentId, version.version].join('_')),
    );

    // Get the dependency information in the component, and exclude the component information that has been obtained
    let dependencies = this.getComponentEditorAndDependence(_.map(versionList, 'content'));
    dependencies = _.dropWhile(
      dependencies,
      (item) => componentInfos[[item.id, item?.version || ''].join('_')],
    );

    // Recursively get component details
    if (dependencies.length > 0) {
      const dependenciesComponents = await this.getComponentDetailByIdVersion(dependencies, componentInfos);
      componentInfos = Object.assign(componentInfos, dependenciesComponents);
    }

    return componentInfos;
  }

  /**
   * Get the versionNumber corresponding to version by id, version
   * If version is empty or undefined, take the live version corresponding to id
   * Return:
   * [
   *  {id:xxx, versionNumbers: [1]},
   *  {id:xxx, version:0.0.2, versionNumbers: [2]},
   * ]
   * @param  {IdVersion[]} idVersions
   * @returns Promise
   */
  async getComponentVersionNumberFromVersion(idVersions: IdVersion[]): Promise<{
    idNumbers: IdVersionNumbers[];
    liveVersionIds: string[];
  }> {
    let idVersionNumbers: IdVersionNumbers[] = [];
    let liveIdVersions: string[] = [];

    idVersions.forEach((item) => {
      if (item.version) {
        const versionNumber = Service.version.number.createNumberFromVersion(item.version);
        idVersionNumbers.push(Object.assign({}, item, { versionNumber }));
      } else {
        liveIdVersions.push(item.id); // Get the live version
      }
    });

    let liveVersionIds: string[] = [];
    if (liveIdVersions.length > 0) {
      const contentLiveMap = await Service.content.list.getContentLiveIds(liveIdVersions);
      liveVersionIds = _.values(contentLiveMap);
    }

    return { idNumbers: idVersionNumbers, liveVersionIds };
  }

  /**
   * Obtain the id and version information of editor and dependencies from the component version
   * @param  {ContentVersion[]} versionList
   * @returns IdVersion
   */
  getComponentEditorAndDependence(versionList: Component[], types?: string[]): IdVersion[] {
    let componentIdVersion: IdVersion[] = [];
    versionList.forEach((version) => {
      if (!types || types.indexOf('editor-entry') !== -1) {
        componentIdVersion = componentIdVersion.concat(version?.resource?.['editor-entry'] || []);
      }

      if (!types || types.indexOf('dependencies') !== -1) {
        componentIdVersion = componentIdVersion.concat(version?.resource?.dependencies || []);
      }
    });
    return _.uniqWith(componentIdVersion, _.isEqual);
  }

  /**
   * Obtain the id and version information of editor and dependencies from the component version
   * @param  {ContentVersion[]} versionList
   * @returns IdVersion
   */
  getEditorAndDependenceFromComponent(componentList: Component[]): IdVersion[] {
    let componentIdVersion: IdVersion[] = [];
    componentList.forEach((component) => {
      componentIdVersion = componentIdVersion.concat(component?.resource?.['editor-entry'] || []);
      componentIdVersion = componentIdVersion.concat(component?.resource?.dependencies || []);
    });
    return componentIdVersion;
  }

  /**
   * Add the name field to the editor-entry and dependencies data in the component
   * Support reference modification
   * @param  {Component[]} componentList
   * @param  {Record<string} componentFileObject
   * @param  {} File>
   * @returns Component
   */
  addNameToEditorAndDepends(
    componentList: ComponentContentInfo[],
    componentFileObject: Record<string, File>,
  ): ComponentContentInfo[] {
    componentList.forEach((component) => {
      if (!component.name && componentFileObject[component.id]) {
        component.name = componentFileObject[component.id]?.name || '';
      }

      ((component?.resource?.dependencies || []) as Dependencies[]).forEach((depend) => {
        depend.name = componentFileObject[depend.id]?.name || '';
      });

      ((component?.resource?.['editor-entry'] || []) as EditorEntry[]).forEach((editor) => {
        editor.name = componentFileObject[editor.id]?.name || '';
      });
    });

    return componentList;
  }

  /**
   * Get component resource host and path by content ids
   *
   * entry: { node:'cont_gyEx3GoTu5cCMGY' }
   * =>
   * entry: {
   *  node: {
        "host": "http://app.ares.fx.xxx.com/",
        "downloadHost": "http://app.ares.fx.xxx.com/",
        "path": "ares-test/flight-searchbox-container/0.3.1/umd/production.min.js",
        "contentId": "cont_gyEx3GoTu5cCMGY",
        "origin": "ARES"
      }
   * }
   * @param  {ComponentDSL} versionContent
   * @returns Promise
   */
  async getComponentResourcePath(versionContent: ComponentDSL): Promise<ComponentDSL> {
    // Get the corresponding resource information in the component
    const contentIds = Service.content.component.getComponentResourceIds(<Component[]>[versionContent]);
    const idVersion = this.getComponentEditorAndDependence(<Component[]>[versionContent]);
    const editorContentIds = _.map(idVersion, 'id');
    const fileContentObject = await Service.file.list.getContentFileByIds(editorContentIds);
    contentIds.push(...editorContentIds);

    // Append the name of the dependency to dependencies
    Service.component.addNameToEditorAndDepends(<ComponentContentInfo[]>[versionContent], fileContentObject);

    const contentList = await Service.content.list.getDetailByIds(contentIds);
    const fileList = await Service.file.info.getDetailByIds(_.map(contentList, 'fileId'));

    const [allFoldersObject, contentAllParents] = await Promise.all([
      Service.folder.list.getAllParentsRecursive(_.uniq(_.map(fileList, 'folderId'))),
      Service.content.list.getContentAllParents(contentIds),
    ]);

    const appResource = await Service.application.getAppResourceFromContent(contentAllParents);
    const contentResource = Service.content.info.getContentResourceTypeInfo(appResource, contentAllParents);

    const folderPath: Record<string, string> = {};
    // Splicing folder path
    Object.keys(allFoldersObject).forEach((folderId) => {
      folderPath[folderId] = '/' + _.map(_.drop(allFoldersObject[folderId]), 'folderPath').join('/');
    });

    const filePath: Record<string, string> = {};
    fileList.forEach((file) => {
      filePath[file.id] = (folderPath[file.folderId] || '') + '/' + file.name;
    });

    const resourceObject: Record<string, object> = {};
    contentList.forEach((content) => {
      resourceObject[content.id] = { realPath: filePath[content.fileId] || '' };
    });

    versionContent.resource = Service.version.component.assignResourceToComponent(
      versionContent?.resource || {},
      resourceObject,
      { contentResource },
    );

    return versionContent;
  }

  /**
   * Get component file info by app id and component name
   * @param applicationId
   * @param componentName
   * @returns
   */
  async getComponentInfoByNames(applicationId: string, componentNames: string[]) {
    return Service.file.info.find({
      applicationId,
      type: TYPE.COMPONENT,
      name: { $in: componentNames },
      deleted: false,
    });
  }

  /**
   * Set the reference component new live status log
   * @param fileId
   * @param options
   */
  async updateReferLiveVersion(contentId: string, fileId: string, options: { ctx: FoxCtx }): Promise<void> {
    // Get referenced applications file id
    const referenceFileList = await Service.file.list.find({
      type: TYPE.COMPONENT,
      deleted: false,
      tags: { $elemMatch: { type: TAG.DELIVERY_REFERENCE, 'reference.id': fileId } },
    });

    (referenceFileList || []).forEach((file) => {
      options.ctx.operations.push(
        ...Service.log.addLogItem(
          LOG.LIVE,
          { id: contentId, contentId },
          {
            fileId: file.id,
            category: { type: TYPE.APPLICATION, id: file.applicationId },
            dataType: TYPE.COMPONENT,
          },
        ),
      );
    });
  }

  /**
   * Get category components list
   * @param params
   * @returns
   */
  async getPageCategoryComponents(params: AppItemSearch): Promise<{ list: File[]; count: number }> {
    const { page, size } = Service.file.info.setPageSize(params);
    const searchParams: any = {
      applicationId: params.applicationId,
      deleted: false,
      type: TYPE.COMPONENT,
      'tags.type': TAG.COMPONENT_CATEGORY,
    };

    if (params.search) {
      searchParams['$or'] = [
        {
          name: { $regex: new RegExp(params.search, 'i') },
        },
        {
          'tags.type': TAG.COMPONENT_CATEGORY,
          $or: [
            {
              'tags.name': { $regex: new RegExp(params.search, 'i') },
            },
            {
              'tags.categoryName': { $regex: new RegExp(params.search, 'i') },
            },
            {
              'tags.groupName': { $regex: new RegExp(params.search, 'i') },
            },
          ],
        },
      ];
    }

    const skip = (page - 1) * size;
    const [list, count] = await Promise.all([
      Model.file.find(searchParams, '', { sort: { createTime: 1 }, skip, limit: size }),
      Model.file.getCountDocuments(searchParams),
    ]);

    return { list, count };
  }

  /**
   * check component is deprecated or delete
   * include the status of reference component
   * @param componentItems
   * @returns
   */
  async checkComponentStatus(
    applicationId: string,
    componentItems: { name: string }[],
  ): Promise<{ deprecatedList: Record<string, string>[]; deletedList: Record<string, string>[] }> {
    const componentNames = _.map(componentItems, 'name');
    let componentFileList = await Service.file.list.find({
      name: { $in: componentNames },
      type: TYPE.COMPONENT,
      applicationId,
    });

    // merge same component exist multi data with deleted status different
    const componentFileObject: Record<string, File> = {};
    componentFileList.forEach((component) => {
      if (!componentFileObject[component.name] || componentFileObject[component.name].deleted) {
        componentFileObject[component.name] = component;
      }
    });
    componentFileList = _.toArray(componentFileObject);

    let referenceIdMap: Record<string, string> = {};
    let deprecatedObject: Record<string, boolean> = {};
    componentFileList.forEach((component) => {
      (component.tags || []).forEach((tag) => {
        tag.type === TAG.DELIVERY_REFERENCE && (referenceIdMap[component.id] = tag.reference.id);
        tag.type === TAG.DEPRECATED && (deprecatedObject[component.id] = tag.status);
      });
    });

    // get reference component infos
    let referenceList: File[] = [];
    let referenceDeprecatedObject: Record<string, boolean> = {};
    if (!_.isEmpty(referenceIdMap)) {
      referenceList = await Service.file.list.getDetailByIds(_.values(referenceIdMap));
      referenceList.forEach((reference) => {
        const deprecatedTag = _.find(reference.tags || [], (tag) => tag.type === TAG.DEPRECATED);
        deprecatedTag && (referenceDeprecatedObject[reference.id] = deprecatedTag.status);
      });
    }

    let deprecatedList: Record<string, string>[] = [];
    let deletedList: Record<string, string>[] = [];
    const referenceObject = _.keyBy(referenceList, 'id');
    componentFileList.forEach((component) => {
      if (
        component.deleted ||
        (referenceIdMap[component.id] && referenceObject[referenceIdMap[component.id]].deleted)
      ) {
        deletedList.push({ id: component.id, name: component.name });
      } else if (deprecatedObject[component.id] || referenceDeprecatedObject[referenceIdMap[component.id]]) {
        deprecatedList.push({ id: component.id, name: component.name });
      }
    });

    return { deprecatedList, deletedList };
  }
}
