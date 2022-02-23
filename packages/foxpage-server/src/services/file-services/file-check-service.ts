import _ from 'lodash';

import { File, Tag } from '@foxpage/foxpage-server-types';

import * as Model from '../../models';
import { AppFileTag, FileCheck } from '../../types/file-types';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class FileCheckService extends BaseService<File> {
  private static _instance: FileCheckService;

  constructor() {
    super(Model.file);
  }

  /**
   * Single instance
   * @returns ContentInfoService
   */
  public static getInstance(): FileCheckService {
    this._instance || (this._instance = new FileCheckService());
    return this._instance;
  }

  /**
   * Verify the existence of the file under the specified conditions.
   * If the id of the result is consistent with the fileId, it does not exist, otherwise it exists
   * @param  {string} fileId
   * @param  {FileCheck} params
   * @returns Promise
   */
  async checkFileNameExist(fileId: string, params: FileCheck): Promise<boolean> {
    const newFileParams: FileCheck = _.pick(params, ['applicationId', 'folderId', 'name', 'type', 'suffix']);
    newFileParams.deleted = false;
    return this.checkExist(newFileParams, fileId);
  }

  /**
   * Verify that the specified pathname already exists
   * @param  {AppFileTag} params
   * @returns Promise
   */
  async pathNameExist(params: AppFileTag): Promise<boolean> {
    const pathName = this.getValidPathname(params.tags);

    if (pathName) {
      const fileList = await Service.file.list.find({
        applicationId: params.applicationId,
        tags: { $elemMatch: { pathname: pathName } },
        deleted: false,
      });

      const existFile = fileList.find((file) => {
        return this.getValidPathname(file?.tags || []) && file.id !== params.fileId;
      });

      return !!existFile;
    }

    return false;
  }

  /**
   * Get a valid pathname
   * @param  {Tag[]} tags
   * @returns string
   */
  getValidPathname(tags: Tag[]): string {
    let pathname: string = '';
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        if (tag.pathname && (_.isNil(tag.status) || tag.status)) {
          pathname = tag.pathname;
        }
      });
    }
    return pathname;
  }
}
