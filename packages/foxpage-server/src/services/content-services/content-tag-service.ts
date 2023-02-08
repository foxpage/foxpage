import _ from 'lodash';

import { Content, ContentVersion, File, Tag } from '@foxpage/foxpage-server-types';
import { tag } from '@foxpage/foxpage-shared';

import { TYPE } from '../../../config/constant';
import * as Model from '../../models';
import { AppTag, TagContentData } from '../../types/content-types';
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
    let fileDetail: Partial<File> = {};
    params.pathname = params.pathname?.toLowerCase();
    if (params.fileId) {
      fileDetail = await Service.file.info.getDetailById(params.fileId);
    } else {
      fileDetail = await Service.file.info.getFileDetailByPathname(
        params.applicationId,
        <string>params.pathname,
      );
    }

    if (this.notValid(fileDetail)) {
      return [];
    }

    // check current match preview mode
    const previewTag = this.getTagsByKeys(params.tags, ['query']);
    const isPreview = !_.isNil(previewTag.query?.preview);
    const contentLiveInfo = await this.getAppContentLiveInfoByTags(
      <string>fileDetail.id,
      params.tags,
      isPreview,
    );

    // Get live details
    let contentVersionDetail: Partial<ContentVersion> = {};
    if (!_.isEmpty(contentLiveInfo)) {
      if (isPreview) {
        contentVersionDetail = await Service.version.info.getMaxBaseContentVersionDetail(contentLiveInfo.id);
      } else {
        contentVersionDetail = await Service.version.info.getDetailById(
          contentLiveInfo.liveVersionId as string,
        );
      }
    }

    return !this.notValid(contentVersionDetail)
      ? [
          {
            id: contentVersionDetail.contentId,
            content: contentVersionDetail.content,
            version: contentVersionDetail.version,
            tags: contentLiveInfo.tags || [],
          } as unknown as TagContentData,
        ]
      : [];
  }

  /**
   * * Get the content that matches the specified tags
   * 1, match pathname tag in file (tag in file only matches pathname)
   * 2, Get all the content in the file in 1 (tag in content can match locale and query)
   * 3, the content tags obtained from 2 match locale and query
   *
   * if the tags has preview value, then do not filter live version
   * @param fileId
   * @param tags
   * @param isPreview
   * @returns
   */
  async getAppContentLiveInfoByTags(
    fileId: string,
    tags: Tag[],
    isPreview: boolean = false,
  ): Promise<Content> {
    // Get all content under file
    let contentList = await Service.content.file.getContentByFileIds([fileId]);

    // Can only match the published content
    if (!isPreview) {
      contentList = contentList.filter((content) => content.liveVersionNumber > 0);
    }

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
  getContentCopyTags(tagsContent: { id: string; tags: any[] }[], tagName: string): Record<string, string> {
    let tagMap: Record<string, string> = {};
    tagsContent.forEach((item) => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach((cell) => {
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
    (tags || []).forEach((tag) => {
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
  async updateExtensionTag(
    contentId: string,
    tags: Record<string, any>,
    options: { ctx: FoxCtx },
  ): Promise<void> {
    const contentDetail = await this.getDetailById(contentId);
    const contentTags = contentDetail.tags || [];
    const tagKeys = _.keys(tags);
    contentTags.forEach((tag) => {
      tagKeys.forEach((key) => {
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

  /**
   * format and complete tags data
   * @param type
   * @param tags
   * @returns
   */
  formatTags(type: string, tags: Record<string, any>[] = []): Record<string, any>[] {
    if (type === TYPE.PAGE) {
      tags.forEach((tag) => {
        if (tag.pathname) {
          tag.isRoute = true;
          tag.pathname = tag.pathname.toLowerCase();
        }
      });
    } else if (type === TYPE.CONTENT) {
      tags.forEach((tag) => {
        tag.locale && (tag.isRoute = true);
      });
    }

    return tags;
  }

  /**
   * merge tags in params and tags in db
   * @param type
   * @param sourceTags
   * @param newTags
   * @returns
   */
  mergeTags(
    type: string,
    sourceTags: Record<string, any>[] = [],
    newTags: Record<string, any>[] = [],
  ): Record<string, any>[] {
    console.log(type, sourceTags);
    return newTags;
  }
}
