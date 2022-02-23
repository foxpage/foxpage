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

import { LOG } from '../../config/constant';
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
    options: { ctx: FoxCtx },
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

    // Save logs
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.VERSION_UPDATE, versionDetail, { fileId: contentDetail?.fileId }),
    );

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
    const idNumbers = await this.getComponentVersionNumberFromVersion(idVersions);

    if (idNumbers.length === 0) {
      return {};
    }

    const idVersionNumbers = idNumbers.map((item) => {
      return { id: item.id, liveVersionNumber: item.versionNumber };
    });

    // Get component details
    const versionList = await Service.version.list.getContentInfoByIdAndNumber(idVersionNumbers);
    componentInfos = Object.assign(
      componentInfos,
      _.keyBy(versionList, (version) => [version.contentId, version.version].join('_')),
    );

    // Get the dependency information in the component, and exclude the component information that has been obtained
    let dependencies = this.getComponentEditorAndDependends(_.map(versionList, 'content'));
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
  async getComponentVersionNumberFromVersion(idVersions: IdVersion[]): Promise<IdVersionNumbers[]> {
    let idVersionNumbers: IdVersionNumbers[] = [];
    let liveIdVersions: IdVersion[] = [];

    idVersions.forEach((item) => {
      if (item.version) {
        const versionNumber = Service.version.number.createNumberFromVersion(item.version);
        idVersionNumbers.push(Object.assign({}, item, { versionNumber }));
      } else {
        liveIdVersions.push(item); // Get the live version
      }
    });

    if (liveIdVersions.length > 0) {
      const contentList = await Service.content.list.getDetailByIds(_.map(liveIdVersions, 'id'));
      contentList.forEach((content) => {
        idVersionNumbers.push({ id: content.id, version: '', versionNumber: content.liveVersionNumber });
      });
    }

    return idVersionNumbers;
  }

  /**
   * Obtain the id and version information of editor and dependencies from the component version
   * @param  {ContentVersion[]} versionList
   * @returns IdVersion
   */
  getComponentEditorAndDependends(versionList: Component[]): IdVersion[] {
    let componentIdVersion: IdVersion[] = [];
    versionList.forEach((version) => {
      componentIdVersion = componentIdVersion.concat(version?.resource?.['editor-entry'] || []);
      componentIdVersion = componentIdVersion.concat(version?.resource?.dependencies || []);
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
    const idVersion = this.getComponentEditorAndDependends(<Component[]>[versionContent]);
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
}
