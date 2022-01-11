import _ from 'lodash';

import { Content, Log } from '@foxpage/foxpage-server-types';

import { LOG, METHOD, PRE, RESPONSE_LEVEL, TYPE } from '../../config/constant';
import * as Model from '../models';
import * as Service from '../services';
import { FoxCtx, PageData } from '../types/index-types';
import { ContentChange, DataLogPage, UserOperationParams } from '../types/log-types';
import { generationId } from '../utils/tools';

import { LogServiceAbstract } from './abstracts/log-service-abstract';

export class LogService extends LogServiceAbstract {
  private static _instance: LogService;

  protected transactionId: string = '';
  protected logData: any[] = [];
  protected logActionMethod: string = ''; // GET|POST|PUT|DELETE
  protected targetDataId: string = ''; // Current operation data id
  protected dataType: string = ''; // Current request data type folder|file|component|editor...

  constructor() {
    super();
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

      const [fileObject, ...logDataList] = await Promise.all([
        Service.file.list.getDetailObjectByIds(fileIds),
        ...logDataIds.map((id) => this.getDataDetail(id)),
      ]);

      const logDataObject = _.keyBy(logDataList, 'id');

      for (const log of ctx.operations) {
        if (!log.content.after && logDataObject[log.content.id]) {
          log.content.after = logDataObject[log.content.id];
        }

        if (!log.content.dataType && log.content.fileId && fileObject[log.content.fileId]) {
          log.content.dataType = fileObject[log.content.fileId]?.type || '';
        }

        allLogs.push(
          Object.assign({}, log, {
            transactionId: ctx.logAttr.transactionId,
            id: generationId(PRE.LOG),
            category: _.isString(log.category) ? this.getLogCategory(log.category, ctx) : log.category,
            operator: operator,
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
  async saveRequest(params: any, options: { ctx: FoxCtx }): Promise<void> {
    // Set current real request method
    params.content.realMethod = (
      options.ctx.logAttr.method ||
      params.content?.request?.method ||
      METHOD.GET
    ).toLowerCase();
    // Do not save get query
    if (params.content.realMethod !== METHOD.GET) {
      // Set current operation id
      params.content.id =
        options.ctx.logAttr.id || params.content.request.body.id || params.content.request.query.id || '';
      params.content.dataType = options.ctx.logAttr.type || undefined;

      if (!_.isEmpty(params.content.request.query)) {
        params.content.request.query = JSON.stringify(params.content.request.query);
      }

      if (!_.isEmpty(params.content.request.body)) {
        params.content.request.body = JSON.stringify(params.content.request.body);
      }

      const logDetail: Log = Object.assign({}, params, {
        id: generationId(PRE.LOG),
        action: 'request',
        transactionId: options.ctx.logAttr.transactionId,
        category: _.isString(params.category)
          ? this.getLogCategory(params.category, options.ctx)
          : params.category,
        operator: options.ctx.userInfo.id,
        deleted: false,
      });

      await Model.log.addDetail(logDetail);
    }
  }

  /**
   * Obtain log classification data
   * @param  {string} type
   */
  getLogCategory(type: string, ctx: FoxCtx): Record<string, string> {
    if (type === LOG.CATEGORY_APPLICATION) {
      return { type, id: ctx.logAttr.applicationId || '' };
    } else if (type === LOG.CATEGORY_ORGANIZATION) {
      return { type, id: ctx.logAttr.organizationId || '' };
    }

    return {};
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
    options?: { dataType?: string; fileId?: string },
  ): any[] {
    !_.isArray(data) && (data = [data]);

    let logData: any[] = [];

    data.forEach((cell) => {
      logData.push({
        action: action,
        category: LOG.CATEGORY_APPLICATION,
        content: {
          id: cell?.id || '',
          contentId: cell?.contentId || '',
          fileId: options?.fileId || undefined,
          dataType: options?.dataType || undefined,
          before: cell,
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
    const skip = ((params.page || 1) - 1) * (params.size || 10);
    const searchParams: any = {
      operator: params.operator,
      'content.realMethod': { $in: [METHOD.POST, METHOD.PUT, METHOD.DELETE] },
      'content.response.code': RESPONSE_LEVEL.SUCCESS,
      createTime: {
        $gte: new Date(new Date(params.startTime)),
        $lt: new Date(new Date(params.endTime)),
      },
    };

    if (params.applicationId) {
      searchParams['content.applicationId'] = params.applicationId;
    }

    if (params.action) {
      searchParams.action = params.action;
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
}
