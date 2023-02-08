import { BaseModel } from './base-model';

/**
 *Content log repository related classes
 */
export class ContentLogModel extends BaseModel {
  private static _instance: ContentLogModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns ContentLogModel
   */
  public static getInstance(): ContentLogModel {
    this._instance || (this._instance = new ContentLogModel());
    return this._instance;
  }
}
