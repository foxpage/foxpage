import _ from 'lodash';

import { Content, Log } from '@foxpage/foxpage-server-types';

import { LOG, METHOD, PRE, TYPE } from '../../config/constant';
import * as Model from '../models';
import * as Service from '../services';
import { FoxCtx, PageData } from '../types/index-types';
import { ContentChange, DataLogPage, UserOperationParams } from '../types/log-types';
import { generationId } from '../utils/tools';

import { BaseService } from './base-service';

export class LogService extends BaseService<Log> {
  private static _instance: LogService;

  protected transactionId: string = '';
  protected logData: any[] = [];
  protected logActionMethod: string = ''; // GET|POST|PUT|DELETE
  protected targetDataId: string = ''; // Current operation data id
  protected dataType: string = ''; // Current request data type folder|file|component|editor...

  constructor() {
    super(Model.log);
  }

  /**
   * Single instance
   * @returns LogService
   */
  public static getInstance(): LogService {
    this._instance || (this._instance = new LogService());
    return this._instance;
  }

  /**
   * Save the change log of the current request
   * @returns Promise
   */
  async saveChangeLogs(ctx: FoxCtx): Promise<void> {
    if (ctx.operations.length > 0) {
      const allLogs: Log[] = [];
      const operator = ctx.userInfo.id;
      let fileIds: string[] = [];
      let logDataIds: string[] = [];

      ctx.operations.forEach((log) => {
        log.content.fileId && fileIds.push(log.content.fileId);
        log.content.id && logDataIds.push(log.content.id);
      });

      const [...logDataList] = await Promise.all([...logDataIds.map((id) => this.getDataDetail(id))]);
      const logDataObject = _.keyBy(logDataList, 'id');

      // Get type all level ids
      const itemIdObject = await this.getCategoryIds(ctx.operations);
      for (const log of ctx.operations) {
        if (!log.content.after && logDataObject[log.content.id]) {
          log.content.after = logDataObject[log.content.id];
        }

        log.category.versionId &&
          (log.category.contentId = itemIdObject.version[log.category.versionId]?.contentId);
        log.category.contentId &&
          (log.category.fileId = itemIdObject.content[log.category.contentId]?.fileId);
        log.category.fileId && (log.category.folderId = itemIdObject.file[log.category.fileId]?.folderId);
        log.category.folderId &&
          (log.category.applicationId = itemIdObject.folder[log.category.folderId]?.applicationId);

        allLogs.push(
          Object.assign({}, log, {
            transactionId: ctx.logAttr.transactionId,
            id: generationId(PRE.LOG),
            category: log.category,
            operator: operator || 'anonymous',
            deleted: false,
          }),
        );
      }

      await Model.log.addDetail(allLogs);
    }
  }

  /**
   * Save current request log
   * @param  {any} params
   * @returns Promise
   */
  async saveRequest(options: { ctx: FoxCtx }): Promise<void> {
    let content: Record<string, any> = options.ctx.log || {};

    // Set current real request method
    content.realMethod = (options.ctx.logAttr.method || content?.request?.method || METHOD.GET).toLowerCase();

    // Do not save query request
    if (content.realMethod !== METHOD.GET) {
      // Set current operation id
      content.id = options.ctx.logAttr.id || content.request.body.id || content.request.query.id || '';
      content.dataType = options.ctx.logAttr.type || undefined;

      if (!_.isEmpty(content.request.query)) {
        content.request.query = JSON.stringify(content.request.query);
      }

      if (!_.isEmpty(content.request.body)) {
        content.request.body = JSON.stringify(this.filterSensitiveData(content.request.body));
      }

      const logDetail: Log = Object.assign({
        id: generationId(PRE.LOG),
        action: 'request',
        transactionId: options.ctx.logAttr.transactionId,
        category: {},
        operator: options.ctx.userInfo?.id || '',
        deleted: false,
        content,
      });

      await Model.log.addDetail(logDetail);
    }
  }

  /**
   * After obtaining the specified time, the content information list on the right.
   * In the returned content, the content tag data is placed in the tag field,
   * and the file data is placed in the file. Others are placed in the corresponding types, such as
   * {
   *  tag:{updates:{},removes:{}},
   *  file:{updates:{},removes:{}},
   *  page:{updates:{},removes:{}},
   *  template:{updates:{},removes:{}},
   *  variable:{updates:{},removes:{}}
   *  ...
   * }
   * @param  {ContentChange} params
   * @returns Promise
   */
  async getChangesContentList(params: ContentChange): Promise<Record<string, any>> {
    // Get the log data of the specified action
    const changeList: any[] = await Model.log.find({
      createTime: { $gte: new Date(new Date(params.timestamp)) },
      action: {
        $in: [
          LOG.LIVE,
          LOG.FILE_REMOVE,
          LOG.FILE_TAG,
          LOG.CONTENT_TAG,
          LOG.CONTENT_REMOVE,
          LOG.META_UPDATE,
        ] as any[],
      }, // Get the data set to live, tags updated data
      'category.id': params.applicationId,
      'category.type': LOG.CATEGORY_APPLICATION,
      'content.id': { $exists: true },
    });

    // Filter all content information
    let fileIds: string[] = [];
    let contentIds: string[] = [];
    let contentIdTypes: Record<string, { id: string; type: string }> = {};
    let logContentId = '';
    changeList.forEach((log) => {
      logContentId = log.content.id;
      if (this.checkDataIdType(logContentId).type === TYPE.VERSION) {
        logContentId = log.content.contentId;
      }

      contentIdTypes[[log.action, log.content.id].join('_')] = { id: logContentId, type: log.action };
      if ([LOG.LIVE, LOG.CONTENT_TAG, LOG.CONTENT_REMOVE, LOG.META_UPDATE].indexOf(log.action) !== -1) {
        contentIds.push(logContentId);
      } else if ([LOG.FILE_TAG, LOG.FILE_REMOVE].indexOf(log.action) !== -1) {
        fileIds.push(logContentId);
      }
    });

    // Get content containing fileId
    const contentList = await Service.content.info.getDetailByIds(contentIds);
    const contentObject = _.keyBy(contentList, 'id');

    // Get file information
    fileIds = fileIds.concat(_.map(contentList, 'fileId'));
    const fileTypeInfo = await Service.file.info.getDetailByIds(fileIds);
    const fileTypeObject = _.keyBy(fileTypeInfo, 'id');

    // Set the return structure
    let [logFileId, logItemType, logTypeName] = ['', '', ''];
    let logChangeObject: Record<string, any> = {};
    for (const logType in contentIdTypes) {
      const logItem = contentIdTypes[logType];
      if ([LOG.FILE_TAG, LOG.FILE_REMOVE].indexOf(logItem.type) !== -1) {
        logFileId = logItem.id;
      } else {
        logFileId = contentObject[logItem.id]?.fileId || '';
      }

      [LOG.FILE_TAG, LOG.FILE_REMOVE].indexOf(logItem.type) !== -1 && (logTypeName = 'file');
      logItem.type === LOG.CONTENT_TAG && (logTypeName = 'tag');
      logItem.type === LOG.CONTENT_REMOVE && (logTypeName = fileTypeObject[logFileId]?.type);
      logItem.type === LOG.LIVE && (logTypeName = fileTypeObject[logFileId]?.type);
      if (logItem.type === LOG.FILE_REMOVE && fileTypeObject[logFileId]?.type === TYPE.COMPONENT) {
        logTypeName = fileTypeObject[logFileId]?.type;
      }

      // Does not return invalid file types or editor components
      if (!logTypeName || logTypeName === TYPE.EDITOR) {
        continue;
      }

      !logChangeObject[logTypeName] && (logChangeObject[logTypeName] = { updates: [], removes: [] });

      logItemType =
        [LOG.FILE_REMOVE, LOG.CONTENT_REMOVE].indexOf(logItem.type) !== -1 ? 'removes' : 'updates';
      logChangeObject[logTypeName][logItemType].push(logItem.id);
    }

    return logChangeObject;
  }

  /**
   * Get the content of the specified id
   * @param  {string} id
   * @returns Promise
   */
  async getDataDetail(id: string): Promise<any> {
    const idPre = id.split('_')[0] || '';
    let afterData: any = {};

    switch (idPre) {
      case PRE.APP:
        afterData = await Service.application.getDetailById(id);
        break;
      case PRE.FOLDER:
        afterData = await Service.folder.info.getDetailById(id);
        break;
      case PRE.FILE:
        afterData = await Service.file.info.getDetailById(id);
        break;
      case PRE.CONTENT:
        afterData = await Service.content.info.getDetailById(id);
        break;
      case PRE.CONTENT_VERSION:
        afterData = await Service.version.info.getDetailById(id);
        break;
    }

    return afterData;
  }

  /**
   * Special log records, the classification is designated as application level,
   * and the content only contains the field data of id and before
   * @param  {string} action
   * @param  {any} data
   * @returns void
   */
  addLogItem<T extends { id: string; contentId?: string }>(
    action: string,
    data: T | T[],
    options?: { dataType?: string; fileId?: string; actionType?: string; category?: Record<string, string> },
  ): any[] {
    !_.isArray(data) && (data = [data]);

    let logData: any[] = [];

    data.forEach((cell) => {
      logData.push({
        action: action,
        actionType: options?.actionType || '',
        category: options?.category || {},
        content: {
          id: cell?.id || '',
          before: action.split('_')[0] === LOG.CREATE ? {} : cell,
        },
      });
    });

    return logData;
  }

  /**
   * Get the special user, special time, special action and special app's operation list and count
   * @param  {UserOperationParams} params
   * @returns {list:Log[], count:number}
   */
  async getUserOperationList(params: UserOperationParams): Promise<{ list: Log[]; count: number }> {
    let applicationIds: string[] = [];
    if (params.organizationId && !params.applicationId) {
      const appList = await Service.application.find({
        organizationId: params.organizationId,
        deleted: false,
      });
      applicationIds = _.map(appList, 'id');
    }

    const skip = ((params.page || 1) - 1) * (params.size || 10);
    const searchParams: any = {
      operator: params.operator,
      action: { $ne: 'request' },
      // 'content.response.code': RESPONSE_LEVEL.SUCCESS,
      createTime: {
        $gte: new Date(new Date(params.startTime)),
        $lt: new Date(new Date(params.endTime)),
      },
    };

    if (applicationIds.length > 0) {
      searchParams['category.applicationId'] = { $in: applicationIds };
    }

    if (params.applicationId) {
      searchParams['category.applicationId'] = params.applicationId;
    }

    const [operationList, operationCount] = await Promise.all([
      this.find(searchParams, '-_id -category._id', {
        sort: { createTime: -1 },
        skip,
        limit: params.size || 10,
      }),
      this.getCount(searchParams),
    ]);

    return { list: operationList, count: operationCount };
  }

  /**
   * Get request details by transaction Id
   * @param  {string} transactionId
   * @returns Promise
   */
  async getListByTransactionId(transactionId: string): Promise<Log[]> {
    return Model.log.find({ transactionId }, '-_id -category._id');
  }

  /**
   * Get the special data history list and counts
   * @param  {DataLogPage} params
   * @returns Promise
   */
  async getDataHistory(params: DataLogPage): Promise<PageData<Log>> {
    const [logList, logCount] = await Promise.all([
      Model.log.getDataPageList(params),
      Model.log.getDataPageCount(params),
    ]);
    return { list: logList, count: logCount };
  }

  /**
   * Get the special ids's base info
   * @param  {string[]} ids
   * @returns Promise
   */
  async getLogDataInfo(ids: string[]): Promise<Record<string, any>> {
    let typeIds: Record<string, string[]> = {};
    _.union(<string[]>_.pullAll(ids, ['', undefined, null])).forEach((id) => {
      const dataType = this.checkDataIdType(id);
      if (dataType.type) {
        !typeIds[dataType.type] && (typeIds[dataType.type] = []);
        typeIds[dataType.type].push(id);
      }
    });

    const dataInfoList: any[][] = await Promise.all([
      Service.org.getDetailByIds(typeIds[TYPE.ORGANIZATION] || []),
      Service.team.getDetailByIds(typeIds[TYPE.TEAM] || []),
      Service.application.getDetailByIds(typeIds[TYPE.APPLICATION] || []),
      Service.folder.list.getDetailByIds(typeIds[TYPE.FOLDER] || []),
      Service.file.list.getDetailByIds(typeIds[TYPE.FILE] || []),
      Service.content.list.getDetailByIds(typeIds[TYPE.CONTENT] || []),
      Service.version.list.getDetailByIds(typeIds[TYPE.VERSION] || []),
    ]);

    let versionObject: Record<string, Content> = {};
    if ((typeIds[TYPE.VERSION] || []).length > 0) {
      const contentIds = _.map(_.last(dataInfoList), 'contentId');
      const contentList = await Service.content.list.getDetailByIds(contentIds);
      const contentObject = _.keyBy(contentList, 'id');
      _.last(dataInfoList)?.forEach((version) => {
        versionObject[version.id] = contentObject[version.contentId];
      });
    }

    return _.merge(_.keyBy(_.flatten(dataInfoList), 'id'), versionObject);
  }

  /**
   * Check data id's type
   * @param  {string} id
   * @returns string
   */
  checkDataIdType(id: string): { id: string; type: string } {
    const typeValue = {
      [PRE.ORGANIZATION]: TYPE.ORGANIZATION,
      [PRE.TEAM]: TYPE.TEAM,
      [PRE.APP]: TYPE.APPLICATION,
      [PRE.FOLDER]: TYPE.FOLDER,
      [PRE.FILE]: TYPE.FILE,
      [PRE.CONTENT]: TYPE.CONTENT,
      [PRE.CONTENT_VERSION]: TYPE.VERSION,
    };

    return { id, type: typeValue[id.slice(0, 4)] };
  }

  /**
   * filter request sensitive data, pwd...
   * @param data
   */
  filterSensitiveData(data: any): any {
    if (data.password) {
      data.password = '********';
    }

    return data;
  }

  /**
   * Get version, content file and folder parent ids
   * @param categoryList
   * @returns
   */
  async getCategoryIds(operationLogs: Record<string, any>[]): Promise<Record<string, any>> {
    let versionIds: string[] = [];
    let contentIds: string[] = [];
    let fileIds: string[] = [];
    let folderIds: string[] = [];

    let versionObject: Record<string, any> = {};
    let contentObject: Record<string, any> = {};
    let fileObject: Record<string, any> = {};
    let folderObject: Record<string, any> = {};

    operationLogs.forEach((log) => {
      log.category.versionId && versionIds.push(log.category.versionId);
      log.category.contentId && contentIds.push(log.category.contentId);
      log.category.fileId && fileIds.push(log.category.fileId);
      log.category.folderId && folderIds.push(log.category.folderId);
    });

    if (versionIds.length > 0) {
      const versionList = await Service.version.list.getDetailObjectByIds(versionIds, 'id contentId');
      contentIds = contentIds.concat(_.map(versionList, 'contentId'));
      versionObject = _.keyBy(versionList, 'id');
    }

    if (contentIds.length > 0) {
      const contentList = await Service.content.list.getDetailObjectByIds(contentIds, 'id fileId');
      fileIds = fileIds.concat(_.map(contentList, 'fileId'));
      contentObject = _.keyBy(contentList, 'id');
    }

    if (fileIds.length > 0) {
      const fileList = await Service.file.list.getDetailObjectByIds(fileIds, 'id folderId');
      folderIds = folderIds.concat(_.map(fileList, 'folderId'));
      fileObject = _.keyBy(fileList, 'id');
    }

    if (folderIds.length > 0) {
      const folderList = await Service.folder.list.getDetailObjectByIds(folderIds, 'id applicationId ');
      folderObject = _.keyBy(folderList, 'id');
    }

    return { version: versionObject, content: contentObject, file: fileObject, folder: folderObject };
  }
}
