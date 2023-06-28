import { BaseModel } from './base-model';

export class FolderModel extends BaseModel {
  private static _instance: FolderModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns FolderModel
   */
  public static getInstance(): FolderModel {
    this._instance || (this._instance = new FolderModel());
    return this._instance;
  }

  getFolderListByParentIds() {
    return [];
  }

  getFolderCountByParentIds() {
    return 1;
  }

  getPageList() {
    return [];
  }

  getCount() {
    return 1;
  }
}
