import { ContentStatus, ContentVersion } from '@foxpage/foxpage-server-types';

import { ContentVersionNumber, ContentVersionString, SearchLatestVersion } from '../types/content-types';

import versionModel from './schema/content-version';
import { BaseModel } from './base-model';

/**
 * Page content version repository related classes
 *
 * @export
 * @class VersionModel
 * @extends {BaseModel<ContentVersion>}
 */
export class VersionModel extends BaseModel<ContentVersion> {
  private static _instance: VersionModel;

  constructor() {
    super(versionModel);
  }

  /**
   * Single instance
   * @returns VersionModel
   */
  public static getInstance(): VersionModel {
    this._instance || (this._instance = new VersionModel());
    return this._instance;
  }

  /**
   * Get the latest version of the specified page
   * @param  {SearchLatestVersion} params
   * @returns {ContentVersion} Promise
   */
  async getLatestVersionInfo(params: SearchLatestVersion): Promise<ContentVersion | null> {
    let searchParams: SearchLatestVersion = { contentId: params.contentId };

    searchParams.deleted = false;
    if (params.deleted !== undefined && params.deleted !== null) {
      searchParams.deleted = params.deleted;
    }

    return this.findOne(searchParams, '', { sort: { versionNumber: -1 } });
  }

  /**
   * Get version details by page ID and version number
   * @param  {string} contentId
   * @param  {number} versionNumber
   * @returns {ContentVersion} Promise
   */
  async getDetailByVersionNumber(contentId: string, versionNumber: number): Promise<ContentVersion> {
    return this.findOne({ contentId, versionNumber, deleted: false });
  }

  /**
   * Set version status
   * @param  {string} id
   * @param  {Partial<ContentStatus>} status
   * @returns Promise
   */
  async setStatus(id: string, status: Partial<ContentStatus>): Promise<any> {
    return this.updateDetail({ id }, { status, updateTime: new Date() });
  }

  /**
   * Get version details by id and version
   * @param  {ContentVersionNumber[]} idAndVersion
   * @returns {ContentVersion[]} Promise
   */
  async getDetailByIdAndVersions(idAndVersion: ContentVersionNumber[]): Promise<ContentVersion[]> {
    if (idAndVersion.length === 0) {
      return [];
    }

    return this.find({ $or: idAndVersion, deleted: false });
  }

  /**
   * Get version details by id and version Number
   * @param  {ContentVersionString[]} idAndVersion
   * @returns {ContentVersion[]} Promise
   */
  async getDetailByIdAndVersionString(idAndVersion: ContentVersionString[]): Promise<ContentVersion[]> {
    if (idAndVersion.length === 0) {
      return [];
    }

    return this.find({ $or: idAndVersion, deleted: false });
  }

  /**
   * Get the maximum version details of the specified page
   * @param  {string} contentId
   * @returns {ContentVersion} Promise
   */
  async getMaxVersionDetailById(
    contentId: string,
    options: Partial<ContentVersion> = {},
  ): Promise<ContentVersion> {
    return this.findOne(Object.assign({ contentId, deleted: false }, options), '', {
      sort: { versionNumber: -1 },
    });
  }
}
