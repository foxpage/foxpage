import { BaseModel } from './base-model';

/**
 * Application repository related classes
 */
export class ApplicationModel extends BaseModel {
  private static _instance: ApplicationModel;

  constructor() {
    super();
  }

  public static getInstance(): ApplicationModel {
    this._instance || (this._instance = new ApplicationModel());
    return this._instance;
  }

  async getAppList() {
    return [];
  }

  async getTotal() {
    return 1;
  }
}
