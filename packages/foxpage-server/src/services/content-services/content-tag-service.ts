import _ from 'lodash';

import { Content, ContentVersion, Tag } from '@foxpage/foxpage-server-types';
import { tag } from '@foxpage/foxpage-shared';

import * as Model from '../../models';
import { AppTag, ContentTagLiveVersion, TagContentData } from '../../types/content-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentTagService extends BaseService<Content> {
  private static _instance: ContentTagService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentTagService
   */
  public static getInstance(): ContentTagService {
    this._instance || (this._instance = new ContentTagService());
    return this._instance;
  }

  /**
   * Get the content information of the specified tags under the application
   * @param  {AppTag} params
   * @returns {SDKTagContentData} Promise
   */
  async getAppContentByTags(params: AppTag): Promise<TagContentData[]> {
    const fileDetail = await Service.file.info.getFileDetailByPathname(params.applicationId, params.pathname);

    if (_.isEmpty(fileDetail)) {
      return [];
    }

    const contentLiveInfo = await this.getAppContentLiveInfoByTags(<string>fileDetail.id, params.tags);

    // Get live details
    let contentVersionList: ContentVersion[] = [];
    if (!_.isEmpty(contentLiveInfo)) {
      contentVersionList = await Service.version.list.getContentInfoByIdAndNumber([contentLiveInfo]);
    }

    const contentLiveInfoObject = _.keyBy([contentLiveInfo], 'id');

    // Put tags into contentVersionList
    return contentVersionList.map((content) => {
      return Object.assign(
        { id: content.contentId, content: content.content },
        { tags: contentLiveInfoObject[content.contentId]?.tags || [] },
      );
    });
  }

  /**
   * Get the content that matches the specified tags
   * 1, match pathname tag in file (tag in file only matches pathname)
   * 2, Get all the content in the file in 1 (tag in content can match locale and query)
   * 3, the content tags obtained from 2 match locale and query
   * @param  {AppTag} params
   * @returns {ContentTagLiveVersion[]} Promise
   */
  async getAppContentLiveInfoByTags(fileId: string, tags: Tag[]): Promise<ContentTagLiveVersion> {
    // Get all content under file
    let contentList = await Service.content.file.getContentByFileIds([fileId]);

    // Can only match the published content
    contentList = contentList.filter((content) => content.liveVersionNumber > 0);

    // Match tags in content, only match the first matching content
    const matchTag = <any>tag.matchContent(<any[]>contentList, tags);

    return matchTag || {};
  }
}
