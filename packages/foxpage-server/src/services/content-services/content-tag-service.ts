import _ from 'lodash';

import { Content, ContentVersion, File, Tag } from '@foxpage/foxpage-server-types';
import { tag } from '@foxpage/foxpage-shared';

import * as Model from '../../models';
import { AppTag, ContentTagLiveVersion, TagContentData } from '../../types/content-types';
import { FoxCtx } from '../../types/index-types';
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
  public static getInstance (): ContentTagService {
    this._instance || (this._instance = new ContentTagService());
    return this._instance;
  }

  /**
   * Get the content information of the specified tags under the application
   * @param  {AppTag} params
   * @returns {SDKTagContentData} Promise
   */
  async getAppContentByTags (params: AppTag): Promise<TagContentData[]> {
    let fileDetail: Partial<File> = {};
    if (params.fileId) {
      fileDetail = await Service.file.info.getDetailById(params.fileId);
    } else {
      fileDetail = await Service.file.info.getFileDetailByPathname(params.applicationId, <string>params.pathname);
    }

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
        { id: content.contentId, content: content.content, version: content.version },
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
  async getAppContentLiveInfoByTags (fileId: string, tags: Tag[]): Promise<ContentTagLiveVersion> {
    // Get all content under file
    let contentList = await Service.content.file.getContentByFileIds([fileId]);

    // Can only match the published content
    contentList = contentList.filter((content) => content.liveVersionNumber > 0);

    // Match tags in content, only match the first matching content
    const matchTag = <any>tag.matchContent(<any[]>contentList, tags);

    return matchTag || {};
  }

  /**
   * Get tag value
   * response { id: tagValue }
   * @param tagsContent 
   * @param tagName 
   * @returns 
   */
  getContentCopyTags (tagsContent: { id: string, tags: any[] }[], tagName: string): Record<string, string> {
    let tagMap: Record<string, string> = {};
    tagsContent.forEach(item => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(cell => {
          if (cell[tagName]) {
            tagMap[item.id] = cell[tagName];
          }
        });
      }
    });

    return tagMap;
  }

  /**
   * Get tags key values
   * @param tags 
   * @param keys 
   * @returns 
   */
  getTagsByKeys(tags: Record<string, any>[], keys: string[]): Record<string, any> {
    let extendInfo: Record<string, any> = {};
    (tags || []).forEach(tag => {
      extendInfo = _.merge(extendInfo, _.pick(tag, keys));
    });

    return extendInfo;
  }

  /**
   * update content tag, if exist, update it, or add tag
   * @param contentId 
   * @param tag 
   * @param options 
   */
  async updateExtensionTag (contentId: string, tags: Record<string, any>, options: { ctx: FoxCtx }): Promise<void> {
    const contentDetail = await this.getDetailById(contentId);
    const contentTags = contentDetail.tags || [];
    const tagKeys = _.keys(tags);
    contentTags.forEach(tag => {
      tagKeys.forEach(key => {
        if (tag[key] !== undefined) {
          tag[key] = tags[key];
          tags = _.omit(tags, [key]);
        }
      });
    });

    if (!_.isEmpty(tags)) {
      contentTags.push(tags);
    }

    options.ctx.transactions.push(this.updateDetailQuery(contentId, { tags: contentTags }));
  }
}
