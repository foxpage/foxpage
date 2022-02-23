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
}
