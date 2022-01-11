import { BaseModelAbstract } from './abstracts/base-model-abstract';

/**
 * Application repository related classes
 */
export class ApplicationModel extends BaseModelAbstract {
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
