import { BaseModel } from './base-model';

/**
 *App Content log repository related classes
 */
export class AppContentLogModel extends BaseModel {
  private static _instance: AppContentLogModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns AppContentLogModel
   */
  public static getInstance(): AppContentLogModel {
    this._instance || (this._instance = new AppContentLogModel());
    return this._instance;
  }
}
