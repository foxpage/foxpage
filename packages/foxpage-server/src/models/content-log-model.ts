import { ContentLog } from '@foxpage/foxpage-server-types';

import contentLogModel from './schema/content-log';
import { BaseModel } from './base-model';

/**
 * Content Log data processing related classes
 *
 * @export
 * @class ContentLogModel
 * @extends {BaseModel<ContentLog>}
 */
export class ContentLogModel extends BaseModel<ContentLog> {
  private static _instance: ContentLogModel;

  constructor() {
    super(contentLogModel);
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
