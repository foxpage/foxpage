import _ from 'lodash';

import { Folder } from '@foxpage/foxpage-server-types';

import { FolderChildrenSearch, FolderPageSearch, WorkspaceFolderSearch } from '../types/file-types';

import folderModel from './schema/folder';
import { BaseModel } from './base-model';

/**
 * Folder repository related classes
 *
 * @export
 * @class FolderModel
 * @extends {BaseModel<Folder>}
 */
export class FolderModel extends BaseModel<Folder> {
  private static _instance: FolderModel;

  constructor() {
    super(folderModel);
  }

  /**
   * Single instance
   * @returns FolderModel
   */
  public static getInstance(): FolderModel {
    this._instance || (this._instance = new FolderModel());
    return this._instance;
  }

  /**
   * Get all folders under the specified folder
   * @param  {any} params
   * @returns Promise
   */
  async getFolderListByParentIds(params: FolderChildrenSearch): Promise<Folder[]> {
    const { page = 1, size = 10, parentFolderIds = [] } = params;
    const filter: { parentFolderId: any; deleted: boolean; name?: any } = {
      parentFolderId: { $in: parentFolderIds },
      deleted: false,
    };
    if (params.search) {
      filter.name = { $regex: new RegExp(params.search, 'i') };
    }

    return this.model
      .find(filter, '-_id -tags._id')
      .sort(params.sort || { createTime: 1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean();
  }

  /**
   * Get the number of folders under the specified folder
   * @param  {any} params
   * @returns Promise
   */
  async getFolderCountByParentIds(params: FolderChildrenSearch): Promise<number> {
    const { parentFolderIds = [] } = params;
    const filter: { parentFolderId: any; deleted: boolean; name?: any } = {
      parentFolderId: { $in: parentFolderIds },
      deleted: false,
    };
    if (params.search) {
      filter.name = { $regex: new RegExp(params.search, 'i') };
    }
    return this.model.countDocuments(filter);
  }

  /**
   * Search the data of each page of the folder
   * @param  {FolderPageSearch} params
   * @returns {Folder[]} Promise
   */
  async getPageList(params: FolderPageSearch): Promise<Folder[]> {
    const from = params.from || 0;
    const to = params.to || 0;

    let searchParams: { $or?: any[]; applicationId: string; parentFolderId?: string; deleted: boolean } = {
      applicationId: params.applicationId,
      deleted: false,
    };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    searchParams['parentFolderId'] = params.parentFolderId || '';

    return this.model
      .find(searchParams, '-_id -tags._id')
      .sort({ createTime: 1 })
      .skip(from)
      .limit(to - from)
      .lean();
  }

  /**
   * Get the total number of folders
   * @param  {FolderPageSearch} params
   * @returns {number} Promise
   */
  async getCount(params: FolderPageSearch): Promise<number> {
    let searchParams: { $or?: any[]; applicationId: string; parentFolderId?: string; deleted: boolean } = {
      applicationId: params.applicationId,
      deleted: false,
    };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    searchParams['parentFolderId'] = params.parentFolderId || '';

    return this.model.countDocuments(searchParams);
  }

  /**
   * Get user special type folder list
   * @param  {WorkspaceFolderSearch} params
   * @returns Promise
   */
  async getWorkspaceFolderList(params: WorkspaceFolderSearch): Promise<Folder[]> {
    const page = params.page || 1;
    const size = params.size || 10;

    let searchParams: { creator: string; 'tags.type': any; deleted: boolean; name?: any } = {
      creator: params.creator,
      'tags.type': params.types.length === 1 ? params.types[0] : { $in: params.types },
      deleted: params.deleted || false,
    };

    if (params.search) {
      searchParams.name = { $regex: new RegExp(params.search, 'i') };
    }

    return this.model
      .find(searchParams, '-_id -tags._id')
      .sort(params.sort || { createTime: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean();
  }

  /**
   * Get the count of user special type folder list
   * @param  {WorkspaceFolderSearch} params
   * @returns Promise
   */
  async getWorkspaceFolderCount(params: WorkspaceFolderSearch): Promise<number> {
    let searchParams: { creator: string; 'tags.type': any; deleted: boolean; name?: any } = {
      creator: params.creator,
      'tags.type': params.types.length === 1 ? params.types[0] : { $in: params.types },
      deleted: params.deleted || false,
    };

    if (params.search) {
      searchParams.name = { $regex: new RegExp(params.search, 'i') };
    }

    return this.model.countDocuments(searchParams);
  }
}
