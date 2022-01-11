import { BaseModelAbstract } from './abstracts/base-model-abstract';

/**
 *Page content repository related classes
 */
export class ContentModel extends BaseModelAbstract {
  private static _instance: ContentModel;

  constructor() {
    super();
  }

  /**
   * Single instance
   * @returns ContentModel
   */
  public static getInstance(): ContentModel {
    this._instance || (this._instance = new ContentModel());
    return this._instance;
  }

  getPageList() {
    return [];
  }

  getLiveNumberByIds() {
    return [];
  }

  getAppFilesContent() {
    return [];
  }

  getContentLiveInfoByIds() {
    return [];
  }

  getContentLiveInfoByFileIds() {
    return [];
  }

  getDetailByFileIds() {
    return [];
  }
}
