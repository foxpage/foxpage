import { Content } from '@foxpage/foxpage-server-types';

import {
  ContentLiveVersion,
  ContentSearch,
  ContentTagLiveVersion,
  FileTagContent,
} from '../types/content-types';

import contentModel from './schema/content';
import { BaseModel } from './base-model';

/**
 *Page content repository related classes
 */
export class ContentModel extends BaseModel<Content> {
  private static _instance: ContentModel;

  constructor() {
    super(contentModel);
  }

  /**
   * Single instance
   * @returns ContentModel
   */
  public static getInstance(): ContentModel {
    this._instance || (this._instance = new ContentModel());
    return this._instance;
  }

  /**
   * Get the file list under the page
   * @param  {ContentSearch} params
   * @returns {Content[]]} Promise
   */
  async getPageList(params: ContentSearch): Promise<Content[]> {
    const page = params.page || 1;
    const size = params.size || 20;
    const from = (page - 1) * size;

    const searchParams: { $or?: any[]; deleted: boolean; fileId: string } = {
      fileId: params.fileId,
      deleted: params.deleted || false,
    };
    if (params.search) {
      searchParams['$or'] = [{ title: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    return this.model
      .find(searchParams, '-_id -tags._id')
      .sort('createTime')
      .skip(from)
      .limit(size)
      .lean();
  }

  /**
   * Get the live version of the specified content
   * @param  {string[]} contentIds
   * @returns {ContentLiveVersion[]} Promise
   */
  async getLiveNumberByIds(contentIds: string[]): Promise<ContentLiveVersion[]> {
    return this.model.find({ id: { $in: contentIds }, deleted: false }, '-_id id liveVersionNumber').lean();
  }

  /**
   * Get the live content information of the specified file
   * @param  {string[]} fileIds
   * @returns {ContentLiveVersion} Promise
   */
  async getAppFilesContent(fileIds: string[]): Promise<ContentLiveVersion[]> {
    return this.model
      .find(
        { fileId: { $in: fileIds }, liveVersionNumber: { $gt: 0 }, deleted: false },
        '-_id id liveVersionNumber',
      )
      .lean();
  }

  /**
   * Get the live number information of the specified published content
   * @param  {string[]} contentIds
   * @returns {ContentLiveVersion[]} Promise
   */
  async getContentLiveInfoByIds(contentIds: string[]): Promise<ContentLiveVersion[]> {
    return this.model
      .find(
        { id: { $in: contentIds }, liveVersionNumber: { $gt: 0 }, deleted: false },
        '-_id id liveVersionNumber',
      )
      .lean();
  }

  /**
   * Get published content Id information through fileIds, tags.
   * All the excluded fields are processed here, because tags need to be returned,
   *  but _id under tags is not returned. If -tags._id tags are used.
   * Path collision error will be reported.
   * @param  {FileTagContent} params
   * @returns {ContentTagLiveVersion[]} Promise
   */
  async getContentLiveInfoByFileIds(params: FileTagContent): Promise<ContentTagLiveVersion[]> {
    const tagsFilter: object[] = [];
    params.tags.forEach((tag: object) => {
      tagsFilter.push({ tags: { $elemMatch: tag } });
    });

    return this.model
      .find(
        { fileId: { $in: params.fileIds }, $and: tagsFilter, liveVersionNumber: { $gt: 0 }, deleted: false },
        '-_id -tags._id -deleted -title -fileId -creator -createTime -updateTime',
      )
      .lean();
  }

  /**
   * Get content information through fileId
   * @param  {string[]} fileIds
   * @returns {Content[]} Promise
   */
  async getDetailByFileIds(fileIds: string[]): Promise<Content[]> {
    return this.model.find({ fileId: { $in: fileIds }, deleted: false }, '-_id -tags._id').lean();
  }
}
