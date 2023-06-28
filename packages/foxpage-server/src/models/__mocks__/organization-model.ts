import { BaseModel } from './base-model';

export class OrgModel extends BaseModel {
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
