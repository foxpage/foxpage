import _ from 'lodash';

import { FileTypes, Folder, IndexContent, ResourceAbstract } from '@foxpage/foxpage-server-types';

import { config } from '../../app.config';
import { PRE, TAG, TYPE } from '../../config/constant';
import * as Service from '../services';
import { ContentPath } from '../types/component-types';
import { VersionNumber } from '../types/content-types';
import { NewResourceDetail } from '../types/file-types';
import { FoxCtx, IdVersion } from '../types/index-types';
import { formatToPath, generationId } from '../utils/tools';

import { PluginService } from './plugin-services';

interface ResourceVersionDetail {
  id: string;
  name: string;
  version: string;
}

export class ResourceService {
  private static _instance: ResourceService;
  private plugins: ResourceAbstract;

  constructor() {
    const pluginInstance = PluginService.getInstance();
    this.plugins = pluginInstance.plugins;
  }

  /**
   * Single instance
   * @returns ResourceService
   */
  public static getInstance (): ResourceService {
    this._instance || (this._instance = new ResourceService());
    return this._instance;
  }

  async getResourceRemoteUrl (type: string, groupConfig: Record<string, string>): Promise<string> {
    const remoteUrls = await this.plugins.resourceRemoteUrl(Object.assign(
      { resourceConfig: config.resourceConfig },
      {
        groupConfig,
        type
      }
    ));

    if (_.isArray(remoteUrls)) {
      const typeUrl = _.find(remoteUrls, { type });
      return typeUrl?.url || '';
    }

    return '';
  }

  /**
   * Get resource list
   * @param  {any} options
   * @returns Promise
   */
  async getResourceList (options: any): Promise<IndexContent> {
    if (_.has(this.plugins, 'resourceList')) {
      const resourceData = await this.plugins.resourceList(options);
      let typeResource: IndexContent | undefined = undefined;
      if (_.isArray(resourceData)) {
        typeResource = _.find(resourceData, { type: options.type });
      }

      return typeResource || { group: '', packages: [] };
    } else {
      return { group: '', packages: [] };
    }
  }

  /**
   * Get the special resource group latest version from remote
   * @param  {string} groupFolderId
   * @param  {any} options
   * @returns Promise
   */
  async getResourceGroupLatestVersion (
    groupFolderId: string,
    options?: { name?: string; packageName?: string, proxy?: string },
  ): Promise<NewResourceDetail[]> {
    const config = await this.getGroupConfig(groupFolderId);
    const [remoteGroupResources, localeGroupResources] = await Promise.all([
      this.getResourceList(Object.assign(config, options)),
      this.getGroupResourceMaxVersion(groupFolderId),
    ]);

    // Check if resource has new version
    let isNewVersion: boolean = false;
    let resourceList: NewResourceDetail[] = [];
    for (const resource of remoteGroupResources.packages || []) {
      isNewVersion = false;
      if (
        resource.foxpage?.resourceName &&
        (!localeGroupResources[resource.foxpage.resourceName] ||
          localeGroupResources[resource.foxpage.resourceName].version !== resource.foxpage?.version)
      ) {
        isNewVersion = true;
      }

      resourceList.push(
        Object.assign(
          _.pick(resource.foxpage, ['name', 'version', 'resourceName', 'meta', 'schema']),
          {
            id: localeGroupResources[resource.foxpage?.resourceName || '']?.id || undefined,
            latestVersion: localeGroupResources[resource.foxpage?.resourceName || '']?.version || '',
            files: resource.files || {},
            isNew: isNewVersion,
          }),
      );
    }

    return _.orderBy(resourceList, ['isNew', 'name'], ['desc', 'asc']);
  }

  /**
   * Get the resource group configs, include app config, group config and common resource config
   * @param  {string} groupFolderId
   * @returns Promise
   */
  async getGroupConfig (groupFolderId: string): Promise<Record<string, any>> {
    const folderDetail = await Service.folder.info.getDetailById(groupFolderId);
    let resourceId = '';
    let groupConfig = {};
    (folderDetail?.tags || []).forEach((tag) => {
      if (tag.type === TAG.RESOURCE_GROUP) {
        resourceId = tag.resourceId;
      } else if (tag.type === TAG.RESOURCE_CONFIG) {
        groupConfig = _.omit(tag, ['type']);
      }
    });

    let groupType = '';
    let appConfig = {};
    const groupName = folderDetail.name;
    if (resourceId && folderDetail.applicationId) {
      const appDetail = await Service.application.getDetailById(folderDetail.applicationId);
      const appResourceDetail = _.filter(appDetail.resources || [], { id: resourceId })?.[0] || {};
      appConfig = appResourceDetail.detail;
      groupType = appResourceDetail.name || '';
    }

    return {
      type: groupType.toLowerCase(),
      name: groupName,
      resourceConfig: config.resourceConfig,
      groupConfig,
      appConfig,
    };
  }

  /**
   * Get the special resource group child max version info
   * response {'resourceId': {id,name,version}}
   * @param  {string} groupFolderId
   * @returns Promise
   */
  async getGroupResourceMaxVersion (groupFolderId: string): Promise<Record<string, ResourceVersionDetail>> {
    const resourceList = await Service.folder.list.find({ parentFolderId: groupFolderId, deleted: false });
    const resourceIds = _.map(resourceList, 'id');

    const resourceMaxVersion = await this.getResourceMaxVersion(resourceIds);
    let resourceVersionObject: Record<string, ResourceVersionDetail> = {};
    for (const resource of resourceList) {
      resourceVersionObject[resource.name] = {
        id: resource.id,
        name: resource.name,
        version: resourceMaxVersion[resource.id]?.version || '',
      };
    }

    return resourceVersionObject;
  }

  /**
   * Check if remote resource exist in db, include check version [folder level]
   * @param  {NewResourceDetail[]} resourceList
   * @param  {{applicationId:string;id:string}} options
   * @returns Promise
   */
  async checkRemoteResourceExist (
    resourceList: NewResourceDetail[],
    options: { applicationId: string; id: string },
  ): Promise<Record<string, any>> {
    let idVersions: { id: string; version: string; resourceName: string }[] = [];
    let resourceNames: string[] = [];
    (resourceList || []).forEach((resource) => {
      resource.id
        ? idVersions.push(_.pick(<Required<NewResourceDetail>>resource, ['id', 'version', 'resourceName']))
        : resourceNames.push(resource.resourceName);
    });

    // Check resource with id, version
    let checkResourceVersionParams = [];
    for (const item of idVersions) {
      checkResourceVersionParams.push({ parentFolderId: item.id, name: item.version });
    }

    let existIdVersions: Folder[] = [];
    if (checkResourceVersionParams.length > 0) {
      existIdVersions = await Service.folder.list.find({
        applicationId: options.applicationId,
        $or: checkResourceVersionParams,
        deleted: false
      });
    }

    if (existIdVersions.length > 0) {
      // Get all children content ids
      const versionFolderIds = _.map(existIdVersions, 'id');
      const childrenData = await Service.folder.list.getAllChildrenRecursive({
        folderIds: versionFolderIds,
        depth: 5,
        hasContent: true,
      });

      let versionContentIdObject: Record<string, any> = {};
      for (const existVersion of existIdVersions) {
        const contentPathObject = this.formatRecursiveToPath(childrenData[existVersion.id]);
        versionContentIdObject[existVersion.parentFolderId] = _.invert(contentPathObject);
      }

      return { code: 1, data: _.map(existIdVersions, 'name'), contentPath: versionContentIdObject };
    }

    // Check resource with name
    let existResourceNames: Folder[] = [];
    if (resourceNames.length > 0) {
      existResourceNames = await Service.folder.list.find({
        applicationId: options.applicationId,
        parentFolderId: options.id,
        name: { $in: resourceNames },
        deleted: false,
      });
    }

    if (existResourceNames.length > 0) {
      return { code: 2, data: _.map(existResourceNames, 'name') };
    }

    return { code: 0 };
  }

  /**
   * Bulk save resources, include resources all children details
   * @param  {any[]} resourceList
   * @param  {{ctx:FoxCtx;applicationId:string;folderId:string}} options
   * @returns void
   */
  saveResources (
    resourceList: NewResourceDetail[],
    options: { ctx: FoxCtx; applicationId: string; folderId: string },
  ): Record<string, any> {
    let resourceContentIdMap: Record<string, any> = {};

    for (const resource of resourceList) {
      let resourceId = resource.id || '';
      if (!resourceId) {
        // Create resource
        const resourceDetail = Service.folder.info.create(
          {
            name: resource.resourceName || '',
            intro: resource.name || '',
            applicationId: options.applicationId || '',
            parentFolderId: options.folderId || '',
          },
          { ctx: options.ctx },
        );
        resourceId = resourceDetail.id;
      }

      // Create resource version
      const versionFolderDetail = Service.folder.info.create(
        {
          name: resource.version || '',
          applicationId: options.applicationId || '',
          parentFolderId: resourceId,
        },
        { ctx: options.ctx },
      );

      // Create resource file and version
      resourceContentIdMap[resource.resourceName] = this.addResourceChildrenRecursive(resource.files, {
        ctx: options.ctx,
        folderId: versionFolderDetail.id,
        applicationId: options.applicationId,
      });
    }

    return resourceContentIdMap;
  }

  /**
   * Create resource children details, include folder, file, content and version infos
   * @param  {any} resourceChildren
   * @param  {{ctx:FoxCtx;applicationId:string;folderId:string}} options
   * @returns response content id and path mapping object, eg
   * {umd:{'style.css':'cont_xxxx'},cjs:{'production.js':'cont_xxxx'}}
   */
  addResourceChildrenRecursive (
    resourceChildren: any,
    options: { ctx: FoxCtx; applicationId: string; folderId: string },
  ): Record<string, any> {
    let contentIdMap: Record<string, any> = {};
    for (const name in resourceChildren) {
      if (_.isString(resourceChildren[name])) {
        const fileDetail = Service.file.info.create(
          {
            name: name,
            applicationId: options.applicationId,
            folderId: options.folderId || '',
            type: TYPE.RESOURCE as FileTypes,
          },
          { ctx: options.ctx },
        );

        // Create content
        const contentId = generationId(PRE.CONTENT);
        contentIdMap[name] = contentId;
        Service.content.info.create(
          { id: contentId, title: name, fileId: fileDetail.id, applicationId: options.applicationId },
          { ctx: options.ctx },
        );

        // Create version
        Service.version.info.create(
          {
            contentId: contentId,
            content: { id: contentId, realPath: resourceChildren[name] },
          },
          { ctx: options.ctx },
        );
      } else {
        const folderDetail = Service.folder.info.create(
          {
            name: name,
            applicationId: options.applicationId || '',
            folderPath: formatToPath(<string>name),
            parentFolderId: options.folderId,
          },
          { ctx: options.ctx },
        );

        // Recursive create children
        const childrenContentIdMap = this.addResourceChildrenRecursive(resourceChildren[name], {
          ctx: options.ctx,
          folderId: folderDetail.id,
          applicationId: options.applicationId,
        });
        contentIdMap[name] = childrenContentIdMap;
      }
    }

    return contentIdMap;
  }

  /**
   * Get the special resource folder data, include version folder, file
   * then format to path, eg.
   *  fold_xxx:[
   *   {id:'cont_xxx1', path: 'resourceGroup/bg-banner-container/0.2.0/schema.json'},
   *   {id:'cont_xxx2', path: 'resourceGroup/bg-banner-container/0.2.0/cjs/production.js'}
   *   {id:'cont_xxx3', path: 'resourceGroup/bg-banner-container/0.2.0/umd/style.css'}
   *  ]
   * @param  {string} groupId
   * @param  {{id:string;version:string}[]} idVersions
   * @param  {} Record<string
   * @returns Promise
   */
  async getResourceVersionDetail (
    groupId: string,
    idVersions: IdVersion[],
  ): Promise<Record<string, ContentPath[]>> {
    const searchParams = _.map(idVersions, (item) => {
      return { parentFolderId: item.id, name: item.version };
    });

    const [resourceGroupInfo, resourceFolderList, resourceParentFolderList] = await Promise.all([
      Service.folder.info.getDetailById(groupId),
      Service.folder.list.find({ $or: searchParams, deleted: false }),
      Service.folder.list.getDetailByIds(_.map(idVersions, 'id')),
    ]);

    const groupPath = resourceGroupInfo?.folderPath || '';
    const resourceVersionIds = _.map(resourceFolderList, 'id');
    const resourceFolderObject = _.keyBy(resourceFolderList, 'id');
    const resourceParentFolderObject = _.keyBy(resourceParentFolderList, 'id');
    // Get resource version all children folder, file, content and version info

    const childrenInfo = await Service.folder.list.getAllChildrenRecursive({
      folderIds: resourceVersionIds,
      depth: 5,
      hasContent: true,
    });

    let resourcePathObject: Record<string, ContentPath[]> = {};
    for (const folderId in childrenInfo) {
      const parentFolderId = resourceFolderObject[folderId]?.parentFolderId || '';
      if (parentFolderId) {
        const resourcePath = this.formatRecursiveToPath(childrenInfo[folderId]);
        resourcePathObject[parentFolderId] = [];
        _.forIn(resourcePath, (path, key) => {
          resourcePathObject[parentFolderId].push({
            contentId: key,
            path: [
              groupPath,
              resourceParentFolderObject?.[parentFolderId]?.folderPath || '',
              resourceFolderObject[folderId].folderPath,
              path,
            ].join('/'),
          });
        });
      }
    }

    return resourcePathObject;
  }

  formatRecursiveToPath (childrenInfo: any): Record<string, string> {
    let resourcePath: Record<string, string> = {};

    if ((childrenInfo?.files || []).length > 0) {
      childrenInfo.files.forEach((file: any) => {
        file.contents?.[0]?.id && (resourcePath[file.contents[0].id] = file.name);
      });
    }

    if ((childrenInfo?.folders || []).length > 0) {
      childrenInfo.folders.forEach((child: any) => {
        if (child?.children) {
          const childResourcePath = this.formatRecursiveToPath(child.children);
          _.forIn(childResourcePath, (item, key) => {
            childResourcePath[key] = child.folderPath + '/' + item;
          });

          resourcePath = _.merge(resourcePath, childResourcePath);
        }
      });
    }

    return resourcePath;
  }

  /**
   * Get resource content id by path
   * @param parentId
   * @param pathArr
   * @returns
   */
  async getContentIdByPath (parentId: string, pathArr?: string[]): Promise<string> {
    let contentId = '';
    if (pathArr && pathArr.length > 1) {
      const folderDetail = await Service.folder.info.getDetail({ parentFolderId: parentId, name: pathArr[0], deleted: false });
      contentId = await this.getContentIdByPath(folderDetail.id, _.drop(pathArr));
    } else if (pathArr && pathArr.length === 1) {
      const fileDetail = await Service.file.info.getDetail({ folderId: parentId, name: pathArr[0], deleted: false });
      contentId = await this.getContentIdByPath(fileDetail.id);
    } else {
      const contentDetail = await Service.content.info.getDetail({ fileId: parentId, deleted: false });
      contentId = contentDetail?.id || '';
    }

    return contentId;
  }

  /**
   * Get resource max version infos
   * @param resourceIds
   * @returns
   */
  async getResourceMaxVersion (resourceIds: string[]): Promise<Record<string, VersionNumber>> {
    const resourceVersions = await Service.folder.list.find({
      parentFolderId: { $in: resourceIds },
      deleted: false,
    });
    let maxResourceVersion: Record<string, VersionNumber> = {};
    resourceVersions.forEach(version => {
      const versionNumber = Service.version.number.createNumberFromVersion(_.trim(version.name));
      if (!maxResourceVersion[version.parentFolderId]) {
        maxResourceVersion[version.parentFolderId] = { version: version.name, versionNumber };
      } else if (maxResourceVersion[version.parentFolderId].versionNumber < versionNumber) {
        maxResourceVersion[version.parentFolderId] = { version: version.name, versionNumber };
      }
    });

    return maxResourceVersion;
  }
}
