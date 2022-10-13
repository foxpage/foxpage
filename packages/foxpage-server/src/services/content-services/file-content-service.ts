import _ from 'lodash';

import { Content } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { ContentInfo, ContentSearch, PageContentSearch } from '../../types/content-types';
import { PageData } from '../../types/index-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class FileContentService extends BaseService<Content> {
  private static _instance: FileContentService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentService
   */
  public static getInstance(): FileContentService {
    this._instance || (this._instance = new FileContentService());
    return this._instance;
  }

  /**
   * Get content details through fileIds
   * @param  {string[]} fileIds
   * @returns {Content[]} Promise
   */
  async getContentByFileIds(fileIds: string[]): Promise<Content[]> {
    if (fileIds.length === 0) {
      return [];
    }
    return Model.content.getDetailByFileIds(fileIds);
  }

  /**
   * Get a list of contents paged under the specified file, including the total amount of data
   * @param  {PageContentSearch} params
   * @returns ContentInfo
   */
  async getFilePageContent(params: PageContentSearch): Promise<PageData<ContentInfo>> {
    const [contentCount, contentList] = await Promise.all([
      Model.content.getCountDocuments({ fileId: params.fileId, deleted: false }) as Promise<number>,
      this.getFileContentList(params) as Promise<ContentInfo[]>,
    ]);

    return { count: contentCount, list: contentList };
  }

  /**
   * Get a list of contents under the file, including user name information
   * @param  {ContentSearch} params
   * @returns {ContentInfo[]} Promise
   */
  async getFileContentList(params: ContentSearch): Promise<ContentInfo[]> {
    Service.content.info.setPageSize(params);

    let ContentUserList: ContentInfo[] = [];
    const contentList = await Model.content.getPageList(params);

    if (contentList && contentList.length > 0) {
      // Get user details
      const userIds = _.map(contentList, 'creator');
      const userObject = await Service.user.getUserBaseObjectByIds(userIds);
      ContentUserList = contentList.map((content) => {
        return Object.assign(_.omit(content, 'creator'), {
          version:
            content.liveVersionNumber > 0
              ? Service.version.number.getVersionFromNumber(content.liveVersionNumber)
              : '',
          creator: userObject[content.creator],
        }) as ContentInfo;
      });
    }

    return ContentUserList;
  }

  /**
   * get the locale content list under special file ids
   * @param fileIds
   * @param options {
   *    locale, isLive
   * }
   * @returns
   */
  async getFileLocaleContent(
    fileIds: string[],
    options: { locale?: string; isLive?: boolean },
  ): Promise<Record<string, Content>> {
    if (fileIds.length === 0) {
      return {};
    }

    const { locale = '', isLive = false } = options;
    const searchParams: Record<string, any> = {
      fileId: { $in: fileIds },
      deleted: false,
    };

    if (locale) {
      searchParams['tags.locale'] = locale;
    } else {
      searchParams['tags.isBase'] = true;
    }

    isLive && (searchParams.liveVersionNumber = { $gt: 0 });

    const contentList = await Model.content.find(searchParams);

    return _.keyBy(contentList, 'fileId');
  }
}
