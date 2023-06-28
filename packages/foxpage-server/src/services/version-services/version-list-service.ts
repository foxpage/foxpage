import _ from 'lodash';
import pLimit from 'p-limit';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import { VERSION } from '../../../config/constant';
import * as Model from '../../models';
import {
  ContentLiveVersion,
  ContentVersionInfo,
  ContentVersionNumber,
  ContentVersionString,
  NameVersion,
  VersionSearch,
} from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class VersionListService extends BaseService<ContentVersion> {
  private static _instance: VersionListService;

  constructor() {
    super(Model.version);
  }

  /**
   * Single instance
   * @returns VersionListService
   */
  public static getInstance(): VersionListService {
    this._instance || (this._instance = new VersionListService());
    return this._instance;
  }

  /**
   * Get the details of the version of the corresponding component through contentList and nameVersion,
   * @param  {Content[]} contentList
   * @param  {NameVersion[]} nameVersions
   * @returns Promise
   */
  async getContentVersionListByNameVersion(
    contentList: Content[],
    nameVersions: NameVersion[],
  ): Promise<ContentVersion[]> {
    const contentNameObject = _.keyBy(contentList, 'title');
    let contentVersion: ContentVersionString[] = [];
    let contentLiveIds: string[] = [];
    nameVersions.forEach((content) => {
      if (contentNameObject[content.name]) {
        if (content.version) {
          contentVersion.push({ contentId: contentNameObject[content.name].id, version: content.version });
        } else if (contentNameObject[content.name].liveVersionId) {
          contentLiveIds.push(contentNameObject[content.name].liveVersionId as string);
        }
      }
    });

    // Get content details with version, get live details without version
    const contentVersionList = await Promise.all([
      this.getContentInfoByIdAndVersion(contentVersion),
      this.getVersionListChunk(contentLiveIds),
    ]);

    // Get the resource information associated with the component,
    // and return the component information containing the resource
    const componentList = await Service.version.component.mappingResourceToComponent(
      _.flatten(contentVersionList),
    );

    return componentList;
  }

  /**
   * Get a list of page versions
   * @param  {VersionSearch} params
   * @returns {ContentVersionInfo[]} Promise
   */
  async getVersionList(params: VersionSearch): Promise<ContentVersionInfo[]> {
    const versionList = await Model.version.getList({ search: params, size: 500 });
    const newVersionList = await Service.user.replaceDataUserId<ContentVersion, ContentVersionInfo>(
      versionList,
    );

    return _.orderBy(newVersionList, ['versionNumber'], ['desc']);
  }

  /**
   * Get all version information through content ids
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getVersionByContentIds(contentIds: string[]): Promise<ContentVersion[]> {
    return Model.version.find({ contentId: { $in: contentIds }, deleted: false });
  }

  /**
   * Get the live version details through contentIds, and return the object with contentId as the key name
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getLiveVersionByContentIds(contentIds: string[]): Promise<Record<string, ContentVersion>> {
    const contentLiveIdObject = await Service.content.list.getContentLiveIds(contentIds);

    // Get version information
    const liveVersionList = await this.getVersionListChunk(_.values(contentLiveIdObject));

    return _.keyBy(liveVersionList, 'contentId');
  }

  /**
   * Get the relation dependency information of a single item by list
   * @param  {ContentVersion[]} versionList
   * @param  {boolean=true} isLiveVersion
   */
  async getVersionListRelations(
    versionList: ContentVersion[],
    isLiveVersion: boolean = true,
  ): Promise<Record<string, any[]>> {
    let versionIdObject: Record<string, ContentVersion> = {};
    versionList.forEach((version) => {
      versionIdObject[version.contentId] = version;
    });

    const versionObjectItem = await Service.version.relation.getVersionRelations(
      versionIdObject,
      isLiveVersion,
    );

    let versionObject: Record<string, any[]> = {};
    for (const version of versionList) {
      let contentRelationItems: Record<string, any> = {};
      Object.keys(versionObjectItem).forEach((relationKey) => {
        contentRelationItems[relationKey] = Object.assign({}, versionObjectItem[relationKey]?.content || {}, {
          version: versionObjectItem[relationKey].version || '',
        });
      });

      versionObject = _.merge(versionObject, { [version.contentId]: _.toArray(contentRelationItems) });
    }

    return versionObject;
  }

  /**
   * Get the latest version details of the specified content
   * Return {contentId: versionDetail}
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentMaxVersionDetail(
    contentIds: string[],
    status: string = '',
  ): Promise<Record<string, ContentVersion>> {
    const versionList = await Model.version.find({ contentId: { $in: contentIds }, deleted: false });
    let contentVersionObject: Record<string, ContentVersion> = {};

    for (const version of versionList) {
      if (status && version.status !== status) {
        continue;
      }

      if (!contentVersionObject[version.contentId]) {
        contentVersionObject[version.contentId] = {} as ContentVersion;
      }
      if ((contentVersionObject[version.contentId]?.versionNumber || 0) < version.versionNumber) {
        contentVersionObject[version.contentId] = version;
      }
    }

    return contentVersionObject;
  }

  /**
   * Get the latest version details under the file through the file id,
   * mainly using data with only one content in a file, such as variables, conditions, functions, etc.
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getMaxVersionByFileIds(fileIds: string[]): Promise<Record<string, ContentVersion>> {
    if (fileIds.length === 0) {
      return {};
    }

    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    if (contentList.length === 0) {
      return {};
    }

    const versionObject = await this.getContentMaxVersionDetail(_.map(contentList, 'id'));
    let fileVersionObject: Record<string, ContentVersion> = {};
    contentList.forEach((content) => {
      fileVersionObject[content.fileId] = versionObject[content.id];
    });

    return fileVersionObject;
  }

  /**
   * get version list by ids, 200 version id every requets
   * @param  {liveVersionIds[]} string[]
   * @returns {ContentVersion[]} Promise
   */
  async getVersionListChunk(liveVersionIds: string[]): Promise<ContentVersion[]> {
    // Get live details
    if (liveVersionIds.length > 0) {
      // 5 concurrent requests at the same time, 200 pieces of data are requested each time
      const liveVersionIdsArr = _.chunk(liveVersionIds, 200);
      let contentPromises: Promise<ContentVersion[]>[] = [];
      const limit = pLimit(5);
      liveVersionIdsArr.forEach((item) => {
        contentPromises.push(limit(() => this.getDetailByIds(item)));
      });

      return _.flatten(await Promise.all(contentPromises));
    }
    return [];
  }

  /**
   * Obtain version information by specifying content ID and versionNumber
   * @param  {ContentLiveVersion[]} contentLiveInfo
   * @returns {ContentVersion[]} Promise
   */
  async getContentInfoByIdAndNumber(contentLiveInfo: ContentLiveVersion[]): Promise<ContentVersion[]> {
    let contentLiveDetails: ContentVersion[] = [];

    // Get live details
    if (contentLiveInfo.length > 0) {
      const idAndVersions = _.map(contentLiveInfo, (content) => {
        return { contentId: content.id, versionNumber: content.liveVersionNumber };
      });

      // 5 concurrent requests at the same time, 200 pieces of data are requested each time
      const idAndVersionsArr = _.chunk(idAndVersions, 200);
      let contentPromises: Promise<ContentVersion[]>[] = [];
      const limit = pLimit(5);
      idAndVersionsArr.forEach((item) => {
        contentPromises.push(limit(() => this.getContentByIdAndVersionNumber(item)));
      });

      contentLiveDetails = _.flatten(await Promise.all(contentPromises));
    }

    return contentLiveDetails;
  }

  /**
   * Get version details in batches through contentId and version
   * @param  {ContentVersionNumber[]} idAndVersion
   * @returns {ContentVersion[]} Promise
   */
  async getContentByIdAndVersionNumber(idAndVersion: ContentVersionNumber[]): Promise<ContentVersion[]> {
    return Model.version.getDetailByIdAndVersions(idAndVersion);
  }

  /**
   * Get version details through contentId and version
   * @param  {ContentVersionString[]} idAndVersions
   * @returns {ContentVersion[]} Promise
   */
  async getContentInfoByIdAndVersion(idAndVersions: ContentVersionString[]): Promise<ContentVersion[]> {
    let contentLiveDetails: ContentVersion[] = [];

    // Get live details
    if (idAndVersions.length > 0) {
      // 5 concurrent requests at the same time, 200 pieces of data are requested each time
      const idAndVersionsArr = _.chunk(idAndVersions, 200);
      let contentPromises: any[] = [];
      const limit = pLimit(5);
      idAndVersionsArr.forEach((item) => {
        contentPromises.push(limit(() => this.getContentByIdAndVersionString(item)));
      });

      contentLiveDetails = _.flatten(await Promise.all(contentPromises));
    }

    return contentLiveDetails;
  }

  /**
   * Get version details through contentId and version string
   * @param  {ContentVersionString[]} idAndVersionString
   * @returns {ContentVersion[]} Promise
   */
  async getContentByIdAndVersionString(
    idAndVersionString: ContentVersionString[],
  ): Promise<ContentVersion[]> {
    return Model.version.getDetailByIdAndVersionString(idAndVersionString);
  }

  /**
   * Get live version or build version through contentIds
   * 1, if contentId has a build version, get the build version
   * 2, if contentId does not have a build version, get the live version
   * 3, otherwise take the largest version corresponding to contentId
   * Return format {'contentId','versionNumber'}[]
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentLiveOrBuildVersion(contentIds: string[]): Promise<ContentVersionNumber[]> {
    // Get the largest version corresponding to content
    const contentVersionList = await this.find(
      { contentId: { $in: contentIds }, deleted: false },
      'contentId versionNumber status',
      { sort: { versionNumber: 'desc' } },
    );

    // Get the build version and maximum version
    let baseVersionInfoObject: Record<string, ContentVersionNumber> = {};
    let maxVersionInfoObject: Record<string, ContentVersionNumber> = {};
    contentVersionList.forEach((version) => {
      if (!baseVersionInfoObject[version.contentId] && version.status === VERSION.STATUS_BASE) {
        baseVersionInfoObject[version.contentId] = _.pick(version, ['contentId', 'versionNumber']);
      } else if (!maxVersionInfoObject[version.contentId] && version.status !== VERSION.STATUS_DISCARD) {
        maxVersionInfoObject[version.contentId] = _.pick(version, ['contentId', 'versionNumber']);
      }
    });

    // Get the contentLive version
    let liveVersionInfoObject: ContentVersionNumber[] = [];
    if (!_.isEmpty(maxVersionInfoObject)) {
      const maxVersionContentIds = _.map(_.toArray(maxVersionInfoObject), 'contentId');
      const contentList = await Service.content.list.getDetailByIds(maxVersionContentIds);
      contentList.forEach((content) => {
        if (!baseVersionInfoObject[content.id]) {
          liveVersionInfoObject.push({ contentId: content.id, versionNumber: content.liveVersionNumber });
        }
        maxVersionInfoObject = _.omit(maxVersionInfoObject, content.id);
      });
    }

    return _.concat(_.toArray(baseVersionInfoObject), _.toArray(maxVersionInfoObject), liveVersionInfoObject);
  }
  /**
   * get refer content version detail
   * response {fileId: contentVersion}
   * @param contentList
   * @returns
   */
  async getReferVersionList(fileMaps: Record<string, string>): Promise<Record<string, ContentVersion>> {
    if (_.isEmpty(fileMaps)) {
      return {};
    }

    const fileContentList = await Service.content.file.getContentByFileIds(_.values(fileMaps));
    const fileContentObject = _.keyBy(fileContentList, 'fileId');
    const contentIds = _.map(fileContentList, 'id');
    const versionObject = await Service.version.list.getLiveVersionByContentIds(contentIds);
    let fileVersions: Record<string, ContentVersion> = {};
    for (const fileId in fileMaps) {
      fileVersions[fileId] = versionObject[fileContentObject[fileMaps[fileId]]?.id] || {};
    }

    return fileVersions;
  }
}
