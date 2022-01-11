import _ from 'lodash';

import { File, Folder } from '@foxpage/foxpage-server-types';

import { TAG, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import {
  AppFileList,
  AppFileType,
  AppTypeFileParams,
  FileAssoc,
  FileInfo,
  FilePageSearch,
  FileUserInfo,
} from '../../types/file-types';
import { PageData, PageSize } from '../../types/index-types';
import { FileServiceAbstract } from '../abstracts/file-service-abstract';
import * as Service from '../index';

export class FileListService extends FileServiceAbstract {
  private static _instance: FileListService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns FileListService
   */
  public static getInstance(): FileListService {
    this._instance || (this._instance = new FileListService());
    return this._instance;
  }

  /**
   * Get file list by folder ID
   * @param  {string} folderId
   * @param  {Partial<File>} options
   * @returns Promise
   */
  async getFileListByFolderId(folderId: string, options: Partial<File>): Promise<File[]> {
    return this.model.find(Object.assign({ folderId, deleted: false }, options));
  }

  /**
   * Get all file detail of the specified type under the specified application
   * @param  {AppTypeContent} params
   * @returns {string[]} Promise
   */
  async getAppTypeFileList(params: AppFileType): Promise<File[]> {
    return Model.file.getAppFileList(params);
  }

  /**
   * Get the details of the specified file list under the specified application
   * @param  {AppTypeContent} params
   * @returns {string[]} Promise
   */
  async getAppFileList(params: AppFileList): Promise<File[]> {
    return this.find({ applicationId: params.applicationId, id: { $in: params.ids }, deleted: false });
  }

  /**
   * Get file page data
   * @param  {FilePageSearch} params
   * @returns {FileUserInfo} Promise
   */
  async getPageData(params: FilePageSearch): Promise<PageData<FileUserInfo>> {
    const [fileList, fileCount] = await Promise.all([
      Model.file.getPageList(params),
      Model.file.getCount(params),
    ]);

    // Get the user information corresponding to the file
    const fileUserList = await Service.user.replaceDataUserId<File, FileInfo>(fileList);

    return { list: fileUserList, count: fileCount };
  }

  /**
   * Get file details by content id
   * @param  {string[]} contentIds
   * @returns Promise
   */
  async getContentFileByIds(contentIds: string[]): Promise<Record<string, File>> {
    if (!contentIds || contentIds.length === 0) {
      return {};
    }

    const contentList = await Service.content.list.getDetailByIds(contentIds);
    const fileList = await this.getDetailByIds(_.uniq(_.map(contentList, 'fileId')));
    const fileObject = _.keyBy(fileList, 'id');

    let contentFileObject: Record<string, File> = {};
    contentList.forEach((content) => {
      contentFileObject[content.id] = fileObject[content.fileId] || {};
    });

    return contentFileObject;
  }

  /**
   * Get the paging list of files of the specified type under the application
   * @param  {AppTypeFileParams} params
   * @param  {Partial<PageSize>={}} page
   * @returns File
   */
  async getAppTypeFilePageList(params: AppTypeFileParams, pageInfo: PageSize): Promise<PageData<File>> {
    const skip = (pageInfo.page - 1) * pageInfo.size;
    const filter: AppTypeFileParams & { $and?: any } = {
      applicationId: params.applicationId,
      type: params.type,
      deleted: false,
      $and: [{ name: { $regex: '^(?!__).*' } }], // Exclude system files with names beginning with __
    };

    if (params.search) {
      filter['$and'].push({ name: { $regex: new RegExp(params.search, 'i') } });
    }

    const [fileCount, fileList] = await Promise.all([
      this.getCount(filter),
      this.find(filter, '', { sort: { createTime: -1 }, skip, limit: pageInfo.size }),
    ]);

    return { count: fileCount, list: fileList };
  }

  /**
   * Get the file plus name of the specified file, the creator information,
   * and the largest version information under the file
   * @param  {File[]} fileList
   * @param  {{type:string}} options Optional parameters of the file, type: file type
   * @returns Promise
   */
  async getFileAssocInfo(fileList: File[], options?: { type: string }): Promise<FileAssoc[]> {
    const fileType = options?.type || '';

    if (fileList.length === 0) {
      return [];
    }

    let [fileIds, folderIds, creatorIds] = <string[][]>[[], [], []];
    fileList.forEach((item) => {
      fileIds.push(item.id);
      folderIds.push(item.folderId);
      creatorIds.push(item.creator);
    });
    fileIds = _.uniq(fileIds);

    let promises: any[] = [
      Service.folder.list.getDetailByIds(_.uniq(folderIds)),
      Service.user.getUserBaseObjectByIds(_.uniq(creatorIds)),
      Service.store.goods.find({ 'details.id': { $in: fileIds }, status: 1, deleted: false }),
    ];

    // Only variable and condition return content version value
    if ([TYPE.VARIABLE, TYPE.CONDITION, TYPE.FUNCTION].indexOf(fileType) !== -1) {
      promises.push(Service.version.list.getMaxVersionByFileIds(fileIds));
    } else {
      promises.push(Service.content.list.getContentObjectByFileIds(fileIds));
    }

    const [folderList, creatorObject, onlineList, contentObject] = await Promise.all(promises);

    let fileAssoc: FileAssoc[] = [];
    const folderObject: Record<string, Folder> = _.keyBy(folderList, 'id');
    const fileOnlineObject: Record<string, any> = _.keyBy(_.map(onlineList, 'details'), 'id');
    fileList.forEach((file) => {
      const folderName = folderObject?.[file.folderId]?.name || '';
      fileAssoc.push(
        Object.assign(_.omit(file, ['creator']), {
          contentId: contentObject[file.id]?.contentId || contentObject[file.id]?.id || '',
          folderName: _.startsWith(folderName, '__') ? '' : folderName, // The system folder returns empty by default
          content: contentObject[file.id]?.content || {},
          creator: creatorObject[file.creator] || {},
          online: !!fileOnlineObject[file.id],
        }) as FileAssoc,
      );
    });

    return fileAssoc;
  }

  /**
   * Check the special files has been referenced in the application
   * @param  {string} applicationId
   * @param  {string[]} fileIds
   * @returns Promise
   */
  async getReferencedByIds(applicationId: string, fileIds: string[]): Promise<Record<string, File>> {
    const fileList = await this.find({
      applicationId,
      deleted: false,
      'tags.type': TAG.DELIVERY_REFERENCE,
      'tags.reference.id': { $in: fileIds },
    });
    const referenceFileObject: Record<string, File> = {};
    fileList.forEach((file) => {
      if (file.tags && file.tags[0].reference.id) {
        referenceFileObject[file.tags[0].reference.id] = file;
      }
    });

    return referenceFileObject;
  }
}
