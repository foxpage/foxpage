import _ from 'lodash';

import { Content, ContentVersion } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { ContentVersionNumber, ContentVersionString, NameVersion } from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class VersionNumberService extends BaseService<ContentVersion> {
  private static _instance: VersionNumberService;

  constructor() {
    super(Model.version);
  }

  /**
   * Single instance
   * @returns VersionNumberService
   */
  public static getInstance(): VersionNumberService {
    this._instance || (this._instance = new VersionNumberService());
    return this._instance;
  }

  /**
   * Generate versionNumber 10 000 0002 by version (1.0.2)
   * Large version 0-99, medium version 0-999, small version 0-9999
   * The version format is fixed x.x.x, without suffixes such as alpha and beta
   * @param  {string} version
   * @returns number
   */
  createNumberFromVersion(version: string): number {
    let versionItems = [0, 0, 0];
    const sourceVersionItems = _.slice(_.map(version.split('.'), Number), 0, 3); // Only take the first 3 versions
    versionItems.splice(0, sourceVersionItems.length, ...sourceVersionItems);

    let versionNumber = 0;
    let isValidVersion = true;
    for (let index = 0; index < 3; index++) {
      if (Math.pow(10, index + 2) <= versionItems[index]) {
        isValidVersion = false;
        break;
      }
      versionNumber += versionItems[index] * (index === 0 ? 10e6 : index === 1 ? 10e3 : 1);
    }

    return isValidVersion ? versionNumber : 0;
  }

  /**
   * Convert version number to version
   * @param  {number} versionNumber
   * @returns string
   */
  getVersionFromNumber(versionNumber: number): string {
    if (versionNumber <= 0) {
      return '';
    }

    let versionItems = [0, 0, 0];
    [10e6, 10e3, 1].forEach((item, index) => {
      const numberItem = Math.floor(versionNumber / item);
      versionNumber = versionNumber % item;

      if (numberItem > 0) {
        versionItems[index] = numberItem;
      }
    });

    return versionItems.join('.');
  }

  /**
   * Returns a newer version number than the specified version
   * @param  {string} version
   * @returns string
   */
  getNewVersion(version: string = '0.0.0'): string {
    const versionNumberItems = version ? _.map(version.split('.'), Number) : [0, 0, 0];
    versionNumberItems[2]++;

    return versionNumberItems.join('.');
  }

  /**
   * Get the latest version number of the specified page
   * @param  {string} contentId
   * @returns {number} Promise
   */
  async getLatestVersionNumber(contentId: string): Promise<number> {
    const versionDetail = await Service.version.info.getContentLatestVersion({ contentId });
    return versionDetail?.versionNumber || 0;
  }

  /**
   * Aggregate to get the latest valid version of content
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentMaxVersionByIds(contentIds: string[]): Promise<{ _id: string; versionNumber: number }[]> {
    if (contentIds.length > 0) {
      return Model.version.aggregate([
        { $match: { contentId: { $in: contentIds }, deleted: false } },
        { $group: { _id: '$contentId', versionNumber: { $max: '$versionNumber' } } },
      ]);
    } else {
      return [];
    }
  }

  /**
   * Get version details by version or version number
   * @param  {NameVersion[]} contentNameInfos
   * @param  {Content[]} contentInfos
   * @returns Promise
   */
  async getContentVersionByNumberOrVersion(
    contentNameInfos: NameVersion[],
    contentInfos: Content[],
  ): Promise<ContentVersion[]> {
    const contentNameObject = _.keyBy(contentInfos, 'title');
    let contentVersionString: ContentVersionString[] = [];
    let contentLiveIds: string[] = [];
    contentNameInfos.forEach((content) => {
      if (contentNameObject[content.name] && content.version) {
        contentVersionString.push({
          contentId: contentNameObject[content.name].id,
          version: content.version,
        });
      } else if (contentNameObject[content.name]?.liveVersionId) {
        contentLiveIds.push(contentNameObject[content.name].liveVersionId as string);
      }
    });

    // Get content containing different versions of the same component
    const versionList = await Promise.all([
      Service.version.list.getVersionListChunk(contentLiveIds),
      Service.version.list.getContentInfoByIdAndVersion(contentVersionString),
    ]);

    return _.flatten(versionList);
  }

  /**
   * Get version details by content ID and version number
   * @param  {ContentVersionNumber} params
   * @returns {ContentVersion} Promise
   */
  async getContentByNumber(params: ContentVersionNumber): Promise<ContentVersion> {
    return Model.version.getDetailByVersionNumber(params.contentId, params.versionNumber);
  }

  /**
   * Get version information through contentId and versionNumber,
   * if versionNumber is 0 or empty, then the latest version is taken.
   * @param  {ContentVersionNumber[]} idAndVersion
   * @returns Promise
   */
  async getContentByIdNumber(idAndVersion: ContentVersionNumber[]): Promise<ContentVersion[]> {
    const nonLiveContent = idAndVersion.filter((content) => !content.versionNumber);

    // Get the latest version of the specified content
    if (nonLiveContent.length > 0) {
      const idVersionNumber = await Service.version.number.getContentMaxVersionByIds(
        _.map(nonLiveContent, 'contentId'),
      );
      const idNumberObject = _.keyBy(idVersionNumber, '_id');
      idAndVersion.forEach((content) => {
        if (!content.versionNumber) {
          content.versionNumber = idNumberObject[content.contentId]?.versionNumber || 0;
        }
      });
    }

    return Model.version.getDetailByIdAndVersions(idAndVersion);
  }
}
