import { BaseModel } from './base-model';

export class UserLogModel extends BaseModel {
  private static _instance: UserLogModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns UserLogModel
   */
  public static getInstance(): UserLogModel {
    this._instance || (this._instance = new UserLogModel());
    return this._instance;
  }
}
