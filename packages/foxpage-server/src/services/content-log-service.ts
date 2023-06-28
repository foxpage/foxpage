import _ from 'lodash';

import { ContentLog } from '@foxpage/foxpage-server-types';

import { PRE, VERSION } from '../../config/constant';
import * as Model from '../models';
import * as Service from '../services';
import { DBQuery } from '../types/index-types';
import { ContentLogItem } from '../types/log-types';
import { generationId } from '../utils/tools';

import { BaseService } from './base-service';

export class ContentLogService extends BaseService<ContentLog> {
  private static _instance: ContentLogService;

  constructor() {
    super(Model.contentLog);
  }

  /**
   * Single instance
   * @returns ContentLogService
   */
  public static getInstance(): ContentLogService {
    this._instance || (this._instance = new ContentLogService());
    return this._instance;
  }

  /**
   * create new log query
   * @param logs
   * @param options
   * @returns
   */
  createLogQuery(logs: ContentLogItem[], options: Record<string, string>): DBQuery {
    const { contentId = '', versionId = '', userId = '' } = options;
    return this.addDetailQuery(
      logs.map((log) => {
        return {
          id: generationId(PRE.LOG),
          action: log.action || '',
          category: { contentId, versionId },
          content: log.content || [],
          creator: userId,
          createTime: log.createTime ? new Date(log.createTime) : new Date(),
          updateTime: new Date(),
        };
      }),
    );
  }

  /**
   * check the contents has changed, if change, response the id;
   * @param contentIds
   */
  async getChangedContent(contentIds: string[]): Promise<string[]> {
    let changedContentIds: string[] = [];
    if (contentIds.length === 0) {
      return changedContentIds;
    }
    const versionList = await Service.version.list.find({
      contentId: { $in: contentIds },
      deleted: false,
      status: VERSION.STATUS_BASE,
    });
    const maxBaseVersionObject: Record<string, string> = {};
    versionList.forEach((version) => {
      if (!maxBaseVersionObject[version.contentId]) {
        maxBaseVersionObject[version.contentId] = version.id;
      }
    });
    const versionIds = _.values(maxBaseVersionObject);
    if (versionIds.length > 0) {
      const logVersionList = await Service.contentLog.find(
        {
          'category.versionId': { $in: versionIds },
        },
        'category.contentId',
      );
      logVersionList.map((item) => {
        changedContentIds.push(item.category?.contentId || '');
      });
    }

    return _.uniq(changedContentIds);
  }
}
