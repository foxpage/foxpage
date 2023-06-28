import { ContentLog } from '@foxpage/foxpage-server-types';

import appContentLogModel from './schema/application-content-log';
import { BaseModel } from './base-model';

/**
 * Application Content Log data processing related classes
 *
 * @export
 * @class AppContentLogModel
 * @extends {BaseModel<ContentLog>}
 */
export class AppContentLogModel extends BaseModel<ContentLog> {
  private static _instance: AppContentLogModel;

  constructor() {
    super(appContentLogModel);
  }

  /**
   * Single instance
   * @returns ContentLogModel
   */
  public static getInstance(): AppContentLogModel {
    this._instance || (this._instance = new AppContentLogModel());
    return this._instance;
  }
}
