import _ from 'lodash';

import { AppFolderTypes, Content, ContentVersion, File, Folder } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
import * as Model from '../../models';
import {
  FileContentInfo,
  FileFolderChildren,
  FileFolderContentInfoChildren,
  FileFolderInfo,
  FileInfo,
  FileListSearch,
  FolderChildrenSearch,
  FolderInfo,
  FolderPageSearch,
  FolderUserInfo,
  UserFileFolderSearch,
  WorkspaceFolderSearch,
} from '../../types/file-types';
import { PageData } from '../../types/index-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class FolderListService extends BaseService<Folder> {
  private static _instance: FolderListService;

  constructor() {
    super(Model.folder);
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
  }): Promise<Record<string, FileFolderContentInfoChildren>> {
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

    const searchParams: Record<string, any> = {
      types: params.types || [TYPE.PROJECT_FOLDER],
      userIds: params.userIds || [],
      applicationIds: params.applicationIds || [],
      organizationId: params.organizationId || '',
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
    const appList = await Service.application.find({
      organizationId: params.organizationId,
      deleted: false,
    });
    params.applicationIds = _.map(appList, 'id');

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

  /**
   * Get user involve project
   * @param params
   * @returns
   */
  async getInvolveProject(params: any): Promise<any> {
    const { userId = '', applicationIds = [] } = params;
    const pageSize = this.setPageSize(params);
    const aggregateObject: any[] = [
      {
        $lookup: {
          from: 'fp_application_folder',
          localField: 'relation.projectId',
          foreignField: 'id',
          as: 'project',
        },
      },
      {
        $match: {
          targetId: userId,
          allow: true,
          deleted: false,
          'relation.projectId': { $exists: true },
          'project.deleted': false,
          'project.tags.type': TYPE.PROJECT_FOLDER,
        },
      },
      { $project: { 'relation.projectId': 1 } },
    ];

    if (params.search) {
      aggregateObject[1]['$match']['$or'] = [
        { 'project.name': { $regex: new RegExp(params.search || '', 'i') } },
        { 'project.id': params.search },
      ];
    }

    if (params.applicationIds && params.applicationIds.length > 0) {
      aggregateObject[1]['$match']['relation.applicationId'] = { $in: applicationIds };
    }

    const involveProjects: Folder[] = await Model.auth.aggregate(aggregateObject);

    const projectIds = _.uniq(_.map(involveProjects, 'relation.projectId'));
    const pageProjectIds = _.chunk(projectIds, pageSize.size)[pageSize.page - 1] || [];
    const involveProjectList: FolderInfo[] = [];

    if (pageProjectIds.length > 0) {
      // Get project detail
      const projectList = await Service.folder.list.getDetailByIds(pageProjectIds);
      const [userObject, appList] = await Promise.all([
        Service.user.getUserBaseObjectByIds(_.map(projectList, 'creator')),
        Service.application.getDetailByIds(_.map(projectList, 'applicationId')),
      ]);

      const appObject = _.keyBy(appList, 'id');
      projectList.forEach((project) => {
        involveProjectList.push(
          Object.assign(
            _.omit(project, ['creator', 'applicationId']),
            { creator: userObject[project.creator] },
            { application: _.pick(appObject[project.applicationId], ['id', 'name']) },
          ) as FolderInfo,
        );
      });
    }

    return { list: involveProjectList, count: projectIds.length || 0 };
  }

  /**
   * Get user involve file's project list
   * @param params
   * @returns
   */
  async getInvolveFileProject(params: any): Promise<any> {
    const { userId = '', applicationIds = [] } = params;
    const aggregateObject: any[] = [
      {
        $lookup: {
          from: 'fp_application_file',
          localField: 'relation.fileId',
          foreignField: 'id',
          as: 'file',
        },
      },
      {
        $match: {
          targetId: userId,
          allow: true,
          deleted: false,
          'relation.projectId': { $exists: true },
          'file.deleted': false,
        },
      },
      { $sort: { 'file.createTime': -1 } },
      { $group: { _id: '$file.folderId' } },
      { $project: { 'file.folderId': 1 } },
    ];

    if (params.search) {
      aggregateObject[1]['$match']['$or'] = [
        { name: { $regex: new RegExp(params.search || '', 'i') } },
        { id: params.search },
      ];
    }

    if (params.applicationIds && params.applicationIds.length > 0) {
      aggregateObject[1]['$match']['relation.applicationId'] = { $in: applicationIds };
    }

    const involveProjects = await Model.auth.aggregate(aggregateObject);
    const folderIds = _.flatten(_.map(involveProjects, '_id'));

    const involveProjectList: FolderInfo[] = [];
    if (folderIds.length > 0) {
      // Get project detail
      const pageSize = this.setPageSize(params);
      const projectList = await Service.folder.list.find({ id: { $in: folderIds } }, '', {
        sort: { createTime: -1 },
        skip: (pageSize.page - 1) * pageSize.size,
        limit: pageSize.size,
      });
      const [userObject, appList] = await Promise.all([
        Service.user.getUserBaseObjectByIds(_.map(projectList, 'creator')),
        Service.application.getDetailByIds(_.map(projectList, 'applicationId')),
      ]);

      const appObject = _.keyBy(appList, 'id');
      projectList.forEach((project) => {
        involveProjectList.push(
          Object.assign(
            _.omit(project, ['creator', 'applicationId']),
            { creator: userObject[project.creator] },
            { application: _.pick(appObject[project.applicationId], ['id', 'name']) },
          ) as FolderInfo,
        );
      });
    }

    return { list: involveProjectList, count: involveProjects.length || 0 };
  }

  /**
   * get user projects by user create file
   * @param params
   * @returns
   */
  async getUserFolderListByFile(params: UserFileFolderSearch): Promise<PageData<FolderInfo>> {
    const aggregateObject: any[] = [
      {
        $lookup: {
          from: 'fp_application_folder',
          localField: 'folderId',
          foreignField: 'id',
          as: 'folder',
        },
      },
      {
        $match: {
          type: { $in: params.types || [TYPE.PAGE, TYPE.TEMPLATE, TYPE.BLOCK] },
          deleted: false,
          'folder.deleted': false,
        },
      },
      { $group: { _id: '$folder.id' } },
      { $sort: { 'folder.createTime': -1 } },
      { $project: { 'folder.id': 1 } },
    ];

    if (params.userId) {
      aggregateObject[1]['$match'].creator = params.userId;
    }

    if (params.search) {
      aggregateObject[1]['$match']['$or'] = [
        { name: { $regex: new RegExp(params.search || '', 'i') } },
        { id: params.search },
      ];
    }

    if (params.applicationIds && params.applicationIds.length > 0) {
      aggregateObject[1]['$match'].applicationId = { $in: params.applicationIds };
    }

    const folderIdList = await Model.file.aggregate(aggregateObject);
    const folderIds = _.chunk(_.flatten(_.map(folderIdList, '_id')), params.size)[
      params.page ? params.page - 1 : 0
    ];
    let folderList = await Service.folder.list.getDetailByIds(folderIds || []);

    folderList = _.orderBy(folderList, ['createTime'], ['desc']);

    let folderPageInfo: PageData<FolderInfo> = { list: [], count: folderIdList.length };
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
}
