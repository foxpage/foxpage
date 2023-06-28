import _ from 'lodash';

import { AppFolderTypes, Folder } from '@foxpage/foxpage-server-types';

import { LOG, PRE, TYPE } from '../../../config/constant';
import * as Model from '../../models';
import {
  AppDefaultFolderSearch,
  AppFolderType,
  AppsFolderType,
  AppTypeFolderUpdate,
  FolderPathSearch,
} from '../../types/file-types';
import { FoxCtx, TypeStatus } from '../../types/index-types';
import { formatToPath, generationId } from '../../utils/tools';
import { BaseService } from '../base-service';
import * as Service from '../index';

export class FolderInfoService extends BaseService<Folder> {
  private static _instance: FolderInfoService;

  constructor() {
    super(Model.folder);
  }

  /**
   * Single instance
   * @returns ContentInfoService
   */
  public static getInstance(): FolderInfoService {
    this._instance || (this._instance = new FolderInfoService());
    return this._instance;
  }

  /**
   * Add the details of the new folder, return to the new query
   * @param  {Partial<Folder>} params
   * @param {Options.ignoreUserLog} The status that do not save to content log, default is false
   * @returns Folder
   */
  create(
    params: Partial<Folder>,
    options: { ctx: FoxCtx; actionDataType?: string; ignoreUserLog?: boolean },
  ): Folder {
    const folderDetail: Folder = {
      id: params.id || generationId(PRE.FOLDER),
      name: _.trim(params.name) || '',
      intro: params.intro || '',
      applicationId: params.applicationId || '',
      folderPath: params.folderPath || formatToPath(<string>params.name),
      parentFolderId: params.parentFolderId || '',
      tags: params.tags || [],
      creator: params.creator || options.ctx.userInfo.id,
      deleted: false,
    };

    options.ctx.transactions.push(Model.folder.addDetailQuery(folderDetail));
    !options.ignoreUserLog &&
      Service.userLog.addLogItem(
        { id: folderDetail.id },
        {
          ctx: options.ctx,
          actions: [LOG.CREATE, options.actionDataType || '', TYPE.FOLDER],
          category: { applicationId: folderDetail.applicationId, folderId: folderDetail.id },
        },
      );

    return folderDetail;
  }

  /**
   * Get the id of the specified default folder of the specified application
   * @param  {AppFolderType} params
   * @returns Promise
   */
  async getAppTypeFolderId(params: AppFolderType): Promise<string> {
    const folderIds = await this.getAppDefaultFolderIds({
      applicationIds: [params.applicationId],
      type: params.type,
    });

    return [...folderIds][0] || '';
  }

  /**
   * Get app multi default folder ids
   * @param  {AppsFolderType} params
   * @returns Promise {appId: folderId}
   */
  async getAppsTypeFolderId(params: AppsFolderType): Promise<Record<string, string>> {
    const folderList = await Model.folder.find({
      applicationId: { $in: params.applicationIds },
      parentFolderId: '',
      deleted: false,
      'tags.type': params.type,
    });

    const appFolderMap: Record<string, string> = {};
    _.map(folderList, (folder) => {
      if (folder.tags?.[0]?.type === params.type) {
        appFolderMap[folder.applicationId] = folder.id;
      }
    });

    return appFolderMap;
  }

  /**
   * Get application all default item folder ids
   * @param applicationId
   * @returns
   */
  async getAppDefaultItemFolderIds(applicationId: string): Promise<string[]> {
    const folderList = await Model.folder.find({
      applicationId: applicationId,
      parentFolderId: '',
      deleted: false,
    });

    return _.map(folderList, 'id');
  }

  /**
   * Get the default folder Ids of the specified type under the specified application
   * @param  {AppDefaultFolderSearch} params
   * @returns {string[]} Promise
   */
  async getAppDefaultFolderIds(params: AppDefaultFolderSearch): Promise<Set<string>> {
    const folderDetails = await this.getAppsTypeFolderId(params);
    return new Set(_.values(folderDetails));
  }

  /**
   * Get the id of the folder by path
   * @param  {string} parentFolderId
   * @param  {string[]} pathList
   * @returns Promise
   */
  async getFolderIdByPathRecursive(
    params: FolderPathSearch,
    options: { ctx: FoxCtx; createFolder?: boolean },
  ): Promise<string> {
    const folderPath = params.pathList.shift() || '';
    if (!folderPath) {
      return '';
    }
    const createFolder = options.createFolder || false;

    let folderDetail = await this.getDetail({
      parentFolderId: params.parentFolderId,
      folderPath: folderPath,
      deleted: false,
    });

    // Create folder
    if (!folderDetail && createFolder) {
      folderDetail = this.create(
        {
          applicationId: params.applicationId,
          name: folderPath,
          folderPath,
          parentFolderId: params.parentFolderId,
        },
        { ctx: options.ctx },
      );
    }

    let folderId = folderDetail?.id || '';
    if (folderId && params.pathList.length > 0) {
      folderId = await this.getFolderIdByPathRecursive(
        {
          applicationId: params.applicationId,
          parentFolderId: folderId,
          pathList: params.pathList,
        },
        { ctx: options.ctx, createFolder },
      );
    }

    return folderId;
  }

  /**
   * Add folders of specified types under the application, such as items, variables, conditions, etc.
   * @param  {Folder} folderDetail
   * @param  {Record<string, number | Folder>} type
   * @param  {Record<string, any>} distinctParams, filter same data
   * @returns Promise
   */
  async addTypeFolderDetail(
    folderDetail: Partial<Folder>,
    options: {
      ctx: FoxCtx;
      type: AppFolderTypes;
      actionDataType?: string;
      distinctParams?: Record<string, any>;
    },
  ): Promise<Record<string, number | Folder>> {
    // Get the folder Id of the specified type under the application
    const typeDetail = await Model.folder.findOne({
      applicationId: folderDetail.applicationId,
      parentFolderId: '',
      'tags.type': options.type,
      deleted: false,
    });

    if (!typeDetail) {
      return { code: 1 };
    }

    // Check if the folder is duplicate
    (!options.distinctParams || _.isEmpty(options.distinctParams)) &&
      (options.distinctParams = { name: folderDetail.name });
    const existFolder = await Model.folder.findOne(
      Object.assign(
        {
          applicationId: folderDetail.applicationId,
          parentFolderId: typeDetail.id,
          deleted: false,
        },
        options.distinctParams,
      ),
    );

    if (existFolder) {
      return { code: 2, data: existFolder };
    }

    // Create folder
    folderDetail.parentFolderId = typeDetail.id;
    const newFolderDetail = this.create(folderDetail, {
      ctx: options.ctx,
      actionDataType: options.actionDataType,
    });

    return { code: 0, data: newFolderDetail };
  }

  /**
   * Update the file details of the specified type under the application
   * @param  {AppTypeFolderUpdate} folderDetail
   * @param  {AppFolderTypes} type
   * @returns Promise
   */
  async updateTypeFolderDetail(
    folderDetail: AppTypeFolderUpdate,
    options: { ctx: FoxCtx; actionType?: string },
  ): Promise<Record<string, number>> {
    // Get current folder details
    const typeDetail = await this.getDetail({
      id: folderDetail.id,
      applicationId: folderDetail.applicationId,
    });

    if (!typeDetail) {
      return { code: 2 }; // Invalid folder
    }

    if (folderDetail.name && folderDetail.name !== typeDetail.name) {
      const existDetail = await Model.folder.findOne({
        parentFolderId: typeDetail.parentFolderId,
        applicationId: folderDetail.applicationId,
        name: folderDetail.name,
        deleted: false,
      });

      if (existDetail) {
        return { code: 3 }; // Check if the name is duplicate
      }
    }

    // update folder detail
    const updateDetail = _.omit(folderDetail, ['applicationId', 'id']);
    if (!_.isEmpty(updateDetail)) {
      options.ctx.transactions.push(Model.folder.updateDetailQuery(folderDetail.id, updateDetail));
      Service.userLog.addLogItem(typeDetail, {
        ctx: options.ctx,
        actions: [LOG.UPDATE, options.actionType || '', TYPE.FOLDER],
        category: { applicationId: typeDetail.applicationId, folderId: folderDetail.id },
      });
    }

    return { code: 0 };
  }

  /**
   * Update the specified data directly
   * @param  {string} id
   * @param  {Partial<Content>} params
   * @returns void
   */
  updateContentItem(id: string, params: Partial<Folder>, options: { ctx: FoxCtx }): void {
    options.ctx.transactions.push(Model.folder.updateDetailQuery(id, params));
  }

  /**
   * Update the delete status of the folder.
   * When deleting, you need to check whether there is any content being referenced.
   * When you enable it, you don’t need to check
   * @param  {TypeStatus} params
   * @param  {number} checkType, 1: check reference, 2: check children, "Bit and"
   * @returns Promise
   */
  async setFolderDeleteStatus(
    params: TypeStatus,
    options: { ctx: FoxCtx; checkType?: number },
  ): Promise<Record<string, number>> {
    const folderDetail = await this.getDetailById(params.id);
    if (this.notValid(folderDetail)) {
      return { code: 1 }; // Invalid file information
    }

    const checkType = options.checkType || 0;

    // TODO Check whether there is information referenced by content under the folder
    if (checkType & 1) {
    }

    // Check if folder has valid child, response warning if exist
    if (checkType & 2) {
      const children: any[] = await Promise.all([
        Service.file.list.find({ folderId: params.id, deleted: false }, 'id'),
        this.find({ parentFolderId: params.id, deleted: false }, 'id'),
      ]);

      if (_.flatten(children).length > 0) {
        return { code: 2 };
      }
    }

    // Set the enabled state
    options.ctx.transactions.push(this.setDeleteStatus(params.id, params.status));

    // TODO Save logs

    return { code: 0 };
  }

  /**
   * Set the delete status of specified folders in batches,
   * @param  {Folder[]} folderList
   * @returns void
   */
  batchSetFolderDeleteStatus(
    folderList: Folder[],
    options: { ctx: FoxCtx; status?: boolean; type?: string },
  ): void {
    const status = !(options.status === false);
    options.ctx.transactions.push(this.setDeleteStatus(_.map(folderList, 'id'), status));
    options.ctx.operations.push(
      ...Service.log.addLogItem(LOG.DELETE, folderList, {
        actionType: [LOG.DELETE, options.type || TYPE.FOLDER].join('_'),
        category: { type: TYPE.FOLDER },
      }),
    );
  }
}
