import _ from 'lodash';

import { AppFolderTypes, Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import {
  FileContentInfo,
  FileFolderChildren,
  FileFolderInfo,
  FileInfo,
  FileListSearch,
  FolderChildrenSearch,
  FolderInfo,
  FolderPageSearch,
  FolderUserInfo,
  WorkspaceFolderSearch,
} from '../../types/file-types';
import { PageData } from '../../types/index-types';
import { FolderServiceAbstract } from '../abstracts/folder-service-abstract';
import * as Service from '../index';

export class FolderListService extends FolderServiceAbstract {
  private static _instance: FolderListService;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns ContentInfoService
   */
  public static getInstance(): FolderListService {
    this._instance || (this._instance = new FolderListService());
    return this._instance;
  }

  /**
   * Get the folder list under the specified folder under the application,
   * and only return the format of Folder
   * @param  {string} applicationId
   * @param  {string} parentFolderId
   * @returns {Folder[]} Promise
   */
  async getAppFolderList(applicationId: string, parentFolderId: string): Promise<Folder[]> {
    return Model.folder.find({ applicationId: applicationId, parentFolderId, deleted: false });
  }

  /**
   * Get all the parents of the specified folder and return the parents as an array field
   * {folderId: [{folderId1}, {folderId1's children}, ..., {folderId}]}
   * @param  {string[]} folderIds
   * @returns Promise
   */
  async getAllParentsRecursive(folderIds: string[]): Promise<Record<string, Folder[]>> {
    if (folderIds.length === 0) {
      return {};
    }

    const folderList = await this.model.getDetailByIds(folderIds);
    let parentFolderObject: Record<string, Folder[]> = {};

    if (folderList.length > 0) {
      const parentFolderIds = _.pull(_.map(folderList, 'parentFolderId'), '');
      parentFolderObject = await this.getAllParentsRecursive(parentFolderIds);
    }

    let folderWithParentObject: Record<string, Folder[]> = {};
    folderList.forEach((folder) => {
      let folderWithParent: Folder[] = [];
      if (folder.parentFolderId && parentFolderObject[folder.parentFolderId]) {
        folderWithParent = _.concat(parentFolderObject[folder.parentFolderId], folder);
      } else {
        folderWithParent = [folder];
      }
      folderWithParentObject[folder.id] = folderWithParent;
    });

    return folderWithParentObject;
  }

  /**
   * Get a list of sub-files (folders) under the specified folder
   * @param  {string} folderId
   * @returns FileInfo
   */
  async getPageChildrenList(
    params: FileListSearch,
    fileTypes: string[] = [],
  ): Promise<{ count: number; data: FileFolderInfo }> {
    const folderId = params.id;
    const { page = 1, size = 10 } = params;
    const from = (page - 1) * size;
    const to = from + size;

    // Get application information, get first-level sub-file data
    const [applicationInfo, childFolderFiles] = await Promise.all([
      Service.application.getDetailById(params.applicationId),
      this.getAllChildrenRecursive({ folderIds: [folderId], depth: 1, fileTypes, deleted: params.deleted }),
    ]);

    let folderList = childFolderFiles[folderId]?.folders || [];
    let fileList = childFolderFiles[folderId]?.files || [];
    const total = folderList.length + fileList.length;

    // Calculate how many pieces of data are intercepted from fileList
    let fileFrom: number = 0;
    let fileTo: number = 0;
    if (folderList.length < to && folderList.length > from) {
      fileTo = to - folderList.length;
    } else if (folderList.length < from || folderList.length === 0) {
      fileFrom = from - folderList.length;
      fileTo = to - folderList.length;
    }

    folderList = folderList.slice(from, to);
    fileList = fileList.slice(fileFrom, fileTo);

    // Get user name data
    let userIds = _.map(folderList, 'creator');
    userIds = userIds.concat(_.map(fileList, 'creator'));
    const userObject = await Service.user.getUserBaseObjectByIds(userIds);

    // Combine the returned result containing user information,
    let folderFiles: FileFolderInfo = { folders: [], files: [] };
    folderList.forEach((folder) => {
      folderFiles.folders.push(
        Object.assign({}, _.omit(folder, ['creator', 'children', 'applicationId']), {
          creator: userObject[folder.creator],
          application: _.pick(applicationInfo, ['id', 'name']),
        }) as FolderInfo,
      );
    });

    fileList.forEach((file) => {
      folderFiles.files.push(
        Object.assign({}, _.omit(file, ['creator', 'applicationId']), {
          creator: userObject[file.creator],
          application: _.pick(applicationInfo, ['id', 'name']),
        }) as FileInfo,
      );
    });

    return { count: total, data: folderFiles };
  }

  /**
   * Get all the subsets under the specified folder,
   * including sub-folders and sub-files,
   * by default to get 1 level of sub-level data
   * @param  {string[]} folderIds
   * @param  {boolean=false} hasContent Whether to return content information under file
   * @param  {number=10} depth?
   * @param  {string[]} fileTypes? Get files of the specified type
   * @returns Promise
   */
  async getAllChildrenRecursive(params: {
    folderIds: string[];
    depth?: number;
    hasContent?: boolean;
    fileTypes?: string[];
    deleted?: boolean;
  }): Promise<Record<string, FileFolderChildren>> {
    let { folderIds = [], depth = 1, hasContent = false, fileTypes = [], deleted = false } = params;

    const getFileParams: any = { folderId: { $in: folderIds }, deleted };
    if (fileTypes.length > 0) {
      getFileParams.type = { $in: fileTypes };
    }
    // Get folder sub-folders, sub-files
    const [childrenFolders, childrenFiles] = await Promise.all([
      this.find({ parentFolderId: { $in: folderIds }, deleted }) as Promise<Folder[]>,
      Service.file.info.find(getFileParams) as Promise<FileContentInfo[]>,
    ]);

    // Get folder sub-files/folders
    let childrenFolderFile: Record<string, FileFolderChildren> = {};
    if (--depth && childrenFolders.length > 0) {
      childrenFolderFile = await this.getAllChildrenRecursive({
        folderIds: _.map(childrenFolders, 'id'),
        depth,
        hasContent,
        fileTypes,
        deleted,
      });
    }

    // Get a list of contents under the file
    if (hasContent && childrenFiles.length > 0) {
      const contentList = await Service.content.file.getContentByFileIds(_.map(childrenFiles, 'id'));
      childrenFiles.forEach((file) => {
        file.contents = contentList.filter((content) => content.fileId === file.id);
      });
    }

    let allChildren: Record<string, FileFolderChildren> = {};
    folderIds.forEach((folderId) => {
      allChildren[folderId] = { folders: [], files: [] };
      childrenFolders.forEach((childFolder) => {
        if (childFolder.parentFolderId === folderId) {
          allChildren[folderId].folders.push(
            Object.assign({}, childFolder, { children: childrenFolderFile[childFolder.id] || [] }),
          );
        }
      });

      allChildren[folderId].files = childrenFiles.filter((childFile) => childFile.folderId === folderId);
    });

    return allChildren;
  }

  /**
   * Get the folder list under the specified folder, and return the user and application information
   * @param  {FolderChildrenSearch} params
   * @returns {FolderInfo} Promise
   */
  async getFolderChildrenList(params: FolderChildrenSearch): Promise<PageData<FolderInfo>> {
    let folderPageInfo: PageData<FolderInfo> = { list: [], count: 0 };
    if (!params.parentFolderIds || params.parentFolderIds.length === 0) {
      return folderPageInfo;
    }

    const searchParams: FolderChildrenSearch = {
      parentFolderIds: params.parentFolderIds || [],
      page: params.page || 1,
      size: params.size || 10,
      search: params.search || '',
      sort: { createTime: -1 },
    };

    let folderList: Folder[] = [];
    [folderList, folderPageInfo.count] = await Promise.all([
      Model.folder.getFolderListByParentIds(searchParams),
      Model.folder.getFolderCountByParentIds(searchParams),
    ]);

    const [userObject, appList] = await Promise.all([
      Service.user.getUserBaseObjectByIds(_.map(folderList, 'creator')),
      Service.application.getDetailByIds(_.map(folderList, 'applicationId')),
    ]);

    const appObject = _.keyBy(appList, 'id');
    folderList.forEach((folder) => {
      folderPageInfo.list.push(
        Object.assign(
          _.omit(folder, ['creator', 'applicationId']),
          { creator: userObject[folder.creator] },
          { application: _.pick(appObject[folder.applicationId], ['id', 'name']) },
        ) as FolderInfo,
      );
    });

    return folderPageInfo;
  }

  /**
   * Get paged folder data, including folder creator information
   * @param  {FolderPageSearch} params
   * @param  {AppFolderTypes} type
   * @returns Promise
   */
  async getFolderPageList(params: FolderPageSearch, type: AppFolderTypes): Promise<PageData<FolderUserInfo>> {
    if (!params.parentFolderId) {
      const appTypeFolderIds = await Service.folder.info.getAppDefaultFolderIds({
        applicationIds: [params.applicationId],
        type,
      });

      if (appTypeFolderIds.size === 0) {
        return { list: [], count: 0 };
      }

      params.parentFolderId = [...appTypeFolderIds][0] || '';
    }
    const [folderList, folderCount] = await Promise.all([
      Model.folder.getPageList(params),
      Model.folder.getCount(params),
    ]);

    const folderWithUserInfo = await Service.user.replaceDataUserId<Folder, FolderUserInfo>(folderList);

    return { list: folderWithUserInfo, count: folderCount };
  }

  /**
   * Get the folder id and file id under the specified file,
   * and get all the content id and version id under the file
   * @param  {FileFolderChildren} folderChildren
   * @returns Promise
   */
  async getIdsFromFolderChildren(folderChildren: FileFolderChildren): Promise<Record<string, any[]>> {
    let contents: Content[] = [];
    let versions: ContentVersion[] = [];
    const children = this.getIdsFromFolderRecursive(folderChildren);
    // Get all content ids under the file
    if (children?.files.length > 0) {
      contents = await Service.content.file.getContentByFileIds(_.map(children.files, 'id'));
    }

    // Get all version ids under content
    if (contents.length > 0) {
      versions = await Service.version.list.getVersionByContentIds(_.map(contents, 'id'));
    }

    return { folders: children.folders, files: children.files, contents, versions };
  }

  /**
   * Get file and folder information under the folder
   * @param  {FileFolderChildren} folderChildren
   * @returns string
   */
  getIdsFromFolderRecursive(folderChildren: FileFolderChildren): { files: File[]; folders: Folder[] } {
    let files: File[] = [];
    let folders: Folder[] = [];

    if (folderChildren?.files.length > 0) {
      files = files.concat(folderChildren.files);
    }

    if (folderChildren.folders && folderChildren.folders.length > 0) {
      folderChildren.folders.forEach((folderItem) => {
        folders.push(_.omit(folderItem, ['children']));
        if (folderItem?.children?.folders && folderItem.children.folders.length > 0) {
          const children = this.getIdsFromFolderRecursive(folderItem.children || []);

          files = files.concat(children.files);
          folders = folders.concat(children.folders);
        }
      });
    }

    return { files, folders };
  }

  /**
   * Get the special user and special type folder list
   * response creator name and application name
   * @param  {WorkspaceFolderSearch} params
   * @returns Promise
   */
  async getWorkspaceFolderList(params: WorkspaceFolderSearch): Promise<PageData<FolderInfo>> {
    const [folderList, folderCount] = await Promise.all([
      Model.folder.getWorkspaceFolderList(params),
      Model.folder.getWorkspaceFolderCount(params),
    ]);

    let folderInfoList: FolderInfo[] = [];
    if (folderList.length > 0) {
      const [userObject, appList] = await Promise.all([
        Service.user.getUserBaseObjectByIds(_.map(folderList, 'creator')),
        Service.application.getDetailByIds(_.map(folderList, 'applicationId')),
      ]);

      const appObject = _.keyBy(appList, 'id');
      folderList.forEach((folder) => {
        folderInfoList.push(
          Object.assign(
            _.omit(folder, ['creator', 'applicationId']),
            { creator: userObject[folder.creator] },
            { application: _.pick(appObject[folder.applicationId], ['id', 'name']) },
          ) as FolderInfo,
        );
      });
    }

    return { list: folderInfoList, count: folderCount };
  }

  /**
   * Get aggregate folder data
   * @param  {any[]} aggregate
   * @returns Promise
   */
  async folderAggregate(aggregate: any[]): Promise<any> {
    return this.model.aggregate(aggregate);
  }
}
