import _ from 'lodash';
import mongoose from 'mongoose';

import { File } from '@foxpage/foxpage-server-types';

import { TAG } from '../../config/constant';
import { AppFileType, FileNameSearch, FilePageSearch } from '../types/file-types';

import fileModel from './schema/file';
import { BaseModel } from './base-model';

/**
 * File repository related classes
 *
 * @export
 * @class FileModel
 * @extends {BaseModel<File>}
 */
export class FileModel extends BaseModel<File> {
  private static _instance: FileModel;

  constructor() {
    super(fileModel);
  }

  /**
   * Single instance
   * @returns FileModel
   */
  public static getInstance(): FileModel {
    this._instance || (this._instance = new FileModel());
    return this._instance;
  }

  /**
   * Get the data of each page of the file
   * @param  {FilePageSearch} params
   * @returns {File[]} Promise
   */
  async getPageList(params: FilePageSearch): Promise<File[]> {
    const from = params.from || 0;
    const to = params.to || 0;

    let searchParams: {
      applicationId: string;
      folderId?: string;
      deleted: boolean;
      $or?: any[];
      type?: any;
    } = {
      applicationId: params.applicationId,
      deleted: false,
    };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    if (params.folderId) {
      searchParams['folderId'] = params.folderId;
    }

    if (params.type) {
      const typeList = _.map(params.type.split(','), _.trim);
      searchParams['type'] = typeList.length > 0 ? { $in: typeList } : typeList[0];
    }

    return this.model
      .find(searchParams as mongoose.FilterQuery<File>, '-_id')
      .sort(params.sort || { _id: -1 })
      .skip(from)
      .limit(to - from)
      .lean();
  }

  /**
   * Get the total number of files under specified conditions
   * @param  {FilePageSearch} params
   * @returns {number} Promise
   */
  async getCount(params: FilePageSearch): Promise<number> {
    let searchParams: {
      $or?: any[];
      applicationId: string;
      folderId?: string;
      deleted: boolean;
      type?: any;
    } = {
      applicationId: params.applicationId,
      deleted: false,
    };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    if (params.folderId) {
      searchParams['folderId'] = params.folderId;
    }

    if (params.type) {
      const typeList = _.map(params.type.split(','), _.trim);
      searchParams['type'] = typeList.length > 0 ? { $in: typeList } : typeList[0];
    }

    return this.model.countDocuments(searchParams as mongoose.FilterQuery<File>);
  }

  /**
   * Get file information by name
   * @param  {FileNameSearch} params
   * @returns {File]} Promise
   */
  async getDetailByNames(params: FileNameSearch): Promise<File[]> {
    const filter: Record<string, any> = {
      applicationId: params.applicationId,
      name: { $in: params.fileNames },
      deleted: false,
    };

    if (_.isString(params.type) || params.type.length > 0) {
      filter.type = params.type && _.isArray(params.type) ? { $in: params.type } : params.type;
    }

    return this.model.find(filter as mongoose.FilterQuery<File>, '-_id').lean();
  }

  /**
   * Get all file information of a specified type under a specified application
   * @param  {AppFileType} params
   * @returns Promise
   */
  async getAppFileList(params: AppFileType): Promise<File[]> {
    let searchParams: { applicationId: string; type: any; deleted: boolean; $or?: any; tags?: any } = {
      applicationId: params.applicationId,
      type: _.isString(params.type) ? params.type : { $in: params.type },
      deleted: false,
    };

    if (!_.isNil(params.loadOnIgnite) && params.loadOnIgnite === true) {
      searchParams['tags'] = {
        $elemMatch: { type: TAG.LOAD_ON_IGNITE, status: true },
      };
    }

    if (params.search) {
      searchParams['$or'] = [{ id: params.search }, { name: { $regex: new RegExp(params.search, 'i') } }];
    }

    return this.model.find(searchParams as mongoose.FilterQuery<File>, '-_id').lean();
  }
}
