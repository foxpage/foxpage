import { Log } from '@foxpage/foxpage-server-types';

import { DataLogPage } from '../types/log-types';

import logModel from './schema/log';
import { BaseModel } from './base-model';

/**
 * Log data processing related classes
 *
 * @export
 * @class LogModel
 * @extends {BaseModel<Log>}
 */
export class LogModel extends BaseModel<Log> {
  private static _instance: LogModel;

  constructor() {
    super(logModel);
  }

  /**
   * Single instance
   * @returns LogModel
   */
  public static getInstance(): LogModel {
    this._instance || (this._instance = new LogModel());
    return this._instance;
  }

  /**
   * Get the special data history operation list
   * @param  {DataLogPage} params
   * @returns Promise
   */
  async getDataPageList(params: DataLogPage): Promise<Log[]> {
    return this.model
      .find({ 'content.id': params.id }, '-_id -category._id')
      .sort({ createTime: -1 })
      .skip((params.page - 1) * params.size)
      .limit(params.size)
      .lean();
  }

  /**
   * Get the special data history operation counts
   * @param  {DataLogPage} params
   * @returns Promise
   */
  async getDataPageCount(params: DataLogPage): Promise<number> {
    return this.model.countDocuments({ 'content.id': params.id });
  }
}
