import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class OrgModel extends BaseModelAbstract {
  private static _instance: OrgModel;

  constructor() {
    super();
  }

  public static getInstance(): OrgModel {
    this._instance || (this._instance = new OrgModel());
    return this._instance;
  }

  getPageList() {
    return [];
  }

  getCount() {
    return 1;
  }
}
