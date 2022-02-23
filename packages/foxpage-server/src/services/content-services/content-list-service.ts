import _ from 'lodash';
import pLimit from 'p-limit';

import { Content, ContentVersion, File } from '@foxpage/foxpage-server-types';

import { TAG } from '../../../config/constant';
import * as Model from '../../models';
import { ContentLiveVersion, FolderFileContent } from '../../types/content-types';
import { AppFileType } from '../../types/file-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class ContentListService extends BaseService<Content> {
  private static _instance: ContentListService;

  constructor() {
    super(Model.content);
  }

  /**
   * Single instance
   * @returns ContentListService
   */
  public static getInstance(): ContentListService {
    this._instance || (this._instance = new ContentListService());
    return this._instance;
  }

  /**
   * Get all content information of the specified type under the specified application.
   * If the file is component file and it reference from store,
   * then need replace file id to get content info
   * @param  {AppFileType} params
   * @returns {Content} Promise
   */
  async getAppContentList(params: AppFileType): Promise<Content[]> {
    let contentList: Content[] = [];

    // Get all files id of the specified type under the App
    const fileList: File[] = await Service.file.list.getAppTypeFileList(params);

    if (fileList.length > 0) {
      // Check if file is a reference
      let referenceFileObject: Record<string, string> = {};
      fileList.forEach((file) => {
        file.tags?.forEach((tag) => {
          if (tag.type === TAG.DELIVERY_REFERENCE) {
            referenceFileObject[file.id] = tag.reference.id;
          }
        });
      });

      // Concurrently 1 time each time, 200 fileIds are requested each time
      const referenceIds: string[] = _.values(referenceFileObject);
      const fileIds = _.concat(_.pullAll(_.map(fileList, 'id'), _.keys(referenceFileObject)), referenceIds);

      let promises: any[] = [];
      const limit = pLimit(1);
      _.chunk(fileIds, 200).forEach((fileIds) => {
        promises.push(limit(() => Model.content.getDetailByFileIds(fileIds)));
      });

      contentList = _.flatten(await Promise.all(promises));
    }

    return contentList;
  }

  /**
   * Get the corresponding content and version details through fileIds
   * @param  {string[]} fileIds
   * @returns ContentVersion
   */
  async getContentAndVersionListByFileIds(
    fileIds: string[],
  ): Promise<{ contentList: Content[]; versionList: ContentVersion[] }> {
    let versionList: ContentVersion[] = [];
    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    if (contentList.length > 0) {
      versionList = await Service.version.list.getDetailByIds(_.map(contentList, 'id'));
    }
    return { contentList: contentList, versionList };
  }

  /**
   * Get content details through fileId,
   * only support the situation that there is only one content under the fileId
   * Return content details with fileId as the key name
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getContentObjectByFileIds(fileIds: string[]): Promise<Record<string, Content>> {
    if (fileIds.length === 0) {
      return {};
    }

    const contentList = await Service.content.file.getContentByFileIds(fileIds);
    return _.keyBy(contentList, 'fileId');
  }

  /**
   * Get content live number information through contentIds
   * @param  {string[]} contentIds
   * @returns {ContentLiveVersion[]} Promise
   */
  async getContentLiveInfoByIds(contentIds: string[]): Promise<ContentLiveVersion[]> {
    if (contentIds.length === 0) {
      return [];
    }
    return Model.content.getContentLiveInfoByIds(contentIds);
  }

  /**
   * Get all the superior information of the specified content, including files and folders
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentAllParents(contentIds: string[]): Promise<Record<string, FolderFileContent[]>> {
    const contentList = await this.getDetailByIds(contentIds);

    const fileList = await Service.file.list.getDetailByIds(_.uniq(_.map(contentList, 'fileId')));
    const folderIds = _.map(fileList, 'folderId');
    const fileObject = _.keyBy(fileList, 'id');

    const allParentFolderList = await Service.folder.list.getAllParentsRecursive(folderIds);

    let contentParents: Record<string, FolderFileContent[]> = {};
    for (const content of contentList) {
      let data: any = [content];
      if (fileObject[content.fileId]) {
        data.unshift(fileObject[content.fileId]);
      }

      if (allParentFolderList[fileObject[content.fileId].folderId]) {
        data.unshift(...allParentFolderList[fileObject[content.fileId].folderId]);
      }

      contentParents[content.id] = data;
    }

    return contentParents;
  }
}
