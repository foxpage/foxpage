import _ from 'lodash';

import { File, Tag } from '@foxpage/foxpage-server-types';

import { TYPE } from '../../../config/constant';
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
  async pathNameExist(params: AppFileTag): Promise<string[]> {
    const pathNames = this.getValidPathname(params.tags);

    if (pathNames) {
      const fileList = await Service.file.list.find({
        applicationId: params.applicationId,
        'tags.pathname': { $in: pathNames },
        id: { $ne: params.fileId },
        deleted: false,
      });
      let existPathnames: string[] = [];
      (fileList || []).forEach((file) => {
        const filePathnameTags = _.map(file.tags, 'pathname');
        existPathnames.push(..._.intersection(pathNames, filePathnameTags));
      });

      return existPathnames;
    }

    return [];
  }

  /**
   * Get a valid pathname
   * @param  {Tag[]} tags
   * @returns string
   */
  getValidPathname(tags: Tag[]): string[] {
    let pathNames: string[] = [];
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        if (tag.pathname && (_.isNil(tag.status) || tag.status)) {
          pathNames.push(tag.pathname.toLowerCase());
        }
      });
    }
    return pathNames;
  }

  /**
   * check the contents in files has live version, return has live version's fileId
   * @param fileIds
   * @returns
   */
  async checkFileHasLiveContent(fileIds: string[]): Promise<string[]> {
    if (fileIds.length === 0) {
      return [];
    }

    const [fileContentList, fileList] = await Promise.all([
      Service.content.file.getContentByFileIds(fileIds),
      Service.file.list.getDetailByIds(fileIds),
    ]);
    let hasLiveContentFileIds: string[] = [];

    // check file is reference
    fileList.forEach((file) => {
      if (file.tags && file.tags.length > 0) {
        const referTag = _.find(file.tags, { type: 'reference' });
        referTag?.reference?.id && hasLiveContentFileIds.push(file.id);
      }
    });

    fileContentList.map((content) => {
      if (hasLiveContentFileIds.indexOf(content.fileId) === -1 && content.liveVersionNumber > 0) {
        hasLiveContentFileIds.push(content.fileId);
      }
    });

    return hasLiveContentFileIds;
  }

  /**
   * check the ids or list is under app level
   * only check items in one app
   * block default belong to app level
   * response the ids in app level
   * @param params
   * @returns
   */
  async appLevelFile(params: { ids?: string[]; list?: File[]; appFolderIds?: string[] }): Promise<string[]> {
    let { ids = [], list = [], appFolderIds = [] } = params;
    if (ids.length > 0) {
      list = await Service.file.list.getDetailByIds(ids);
    }

    if (list.length > 0) {
      if (appFolderIds.length === 0) {
        appFolderIds = await Service.folder.info.getAppDefaultItemFolderIds(list[0].applicationId);
      }

      return _(list)
        .filter((item) => appFolderIds.indexOf(item.folderId) !== -1 || item.type === TYPE.BLOCK)
        .map('id')
        .value();
    }

    return [];
  }
}
