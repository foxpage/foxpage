import { UserLog } from '@foxpage/foxpage-server-types';

import userLogModel from './schema/user-log';
import { BaseModel } from './base-model';

/**
 * User Log data processing related classes
 *
 * @export
 * @class UserLogModel
 * @extends {BaseModel<UserLog>}
 */
export class UserLogModel extends BaseModel<UserLog> {
  private static _instance: UserLogModel;

  constructor() {
    super(userLogModel);
  }

  /**
   * Single instance
   * @returns ContentLogModel
   */
  public static getInstance(): UserLogModel {
    this._instance || (this._instance = new UserLogModel());
    return this._instance;
  }
}
