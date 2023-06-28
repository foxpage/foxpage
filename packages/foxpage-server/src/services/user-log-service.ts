import _ from 'lodash';

import { UserLog } from '@foxpage/foxpage-server-types';

import { LOG, PRE, TYPE } from '../../config/constant';
import * as Model from '../models';
import * as Service from '../services';
import { FoxCtx } from '../types/index-types';
import { UserOperationParams } from '../types/log-types';
import { generationId } from '../utils/tools';

import { BaseService } from './base-service';

export class UserLogService extends BaseService<UserLog> {
  private static _instance: UserLogService;

  constructor() {
    super(Model.userLog);
  }

  /**
   * Single instance
   * @returns UserLogService
   */
  public static getInstance(): UserLogService {
    this._instance || (this._instance = new UserLogService());
    return this._instance;
  }

  /**
   * Create content log operation item
   * @param action
   * @param data
   * @param options
   * @returns
   */
  addLogItem<T extends { id: string }>(
    data: T | T[],
    options?: {
      ctx: FoxCtx;
      actions: string[];
      category?: Record<string, any>;
    },
  ): any[] {
    !_.isArray(data) && (data = [data]);
    let userLogData: any[] = [];
    const actionType = (options?.actions || []).join('_');

    data.forEach((cell) => {
      userLogData.push({
        actionType: actionType,
        category: options?.category || {},
        content: [
          {
            id: cell.id || '',
            before: actionType.split('_')[0] === LOG.CREATE ? {} : cell,
          },
        ],
      });
    });

    if (options?.ctx) {
      options.ctx.userLogs.push(...userLogData);
    }

    return userLogData;
  }

  /**
   * Save content operation logs
   * contentLogs: ContentLog
   * @param ctx
   */
  async saveLogs(ctx: FoxCtx): Promise<void> {
    if (ctx.userLogs.length > 0) {
      const operator = ctx.userInfo.id;
      const allLogs: UserLog[] = [];
      const itemIdObject = await Service.log.getCategoryIds(ctx.userLogs);

      let logDataIds: string[] = [];
      ctx.userLogs.forEach((log: any) => logDataIds.push(..._.map(log.content, 'id')));
      const [...logDataList] = await Promise.all([...logDataIds.map((id) => Service.log.getDataDetail(id))]);
      const logDataObject = _.keyBy(logDataList, 'id');

      for (const log of ctx.userLogs) {
        (log.content || []).forEach((item: any) => {
          logDataObject[item.id] && (item.after = logDataObject[item.id]);
        });

        log.category.versionId &&
          (log.category.contentId = itemIdObject.version[log.category.versionId]?.contentId);
        if (log.category.contentId && !log.category.fileId) {
          log.category.fileId = itemIdObject.content[log.category.contentId]?.fileId;
        }
        if (log.category.fileId && !log.category.folderId) {
          log.category.folderId = itemIdObject.file[log.category.fileId]?.folderId;
        }
        log.category.folderId &&
          (log.category.applicationId = itemIdObject.folder[log.category.folderId]?.applicationId);

        allLogs.push(
          Object.assign({}, log, {
            transactionId: ctx.logAttr.transactionId,
            id: generationId(PRE.LOG),
            category: log.category,
            creator: operator || 'anonymous',
          }),
        );
      }

      await Model.userLog.addDetail(allLogs);
    }
  }

  /**
   * Get the special user, special time, special action and special app's operation list and count
   * @param  {UserOperationParams} params
   * @returns {list:Log[], count:number}
   */
  async getUserOperationList(params: UserOperationParams): Promise<{ list: UserLog[]; count: number }> {
    let applicationIds: string[] = [];
    if (params.organizationId && !params.applicationId) {
      const appList = await Service.application.find({
        organizationId: params.organizationId,
        deleted: false,
      });
      applicationIds = _.map(appList, 'id');
    }

    const skip = ((params.page || 1) - 1) * (params.size || 10);
    const searchParams: Record<string, any> = {
      // createTime: {
      //   $gte: new Date(new Date(params.startTime)),
      //   $lt: new Date(new Date(params.endTime)),
      // },
    };

    if (params.type === TYPE.USER) {
      searchParams.creator = params.creator;
    }

    if (applicationIds.length > 0) {
      searchParams['category.applicationId'] = { $in: applicationIds };
    }

    if (params.applicationId) {
      searchParams['category.applicationId'] = params.applicationId;
    }

    const [logList, logCount] = await Promise.all([
      this.find(searchParams, '-_id -category._id', {
        sort: { createTime: -1 },
        skip,
        limit: params.size || 10,
      }),
      this.getCount(searchParams),
    ]);

    return { list: logList, count: logCount };
  }
}
