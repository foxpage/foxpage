import { Picture } from '@foxpage/foxpage-server-types';

import pictureModel from './schema/picture';
import { BaseModel } from './base-model';

/**
 * Picture data processing related classes
 *
 * @export
 * @class PictureModel
 * @extends {BaseModel<Picture>}
 */
export class PictureModel extends BaseModel<Picture> {
  private static _instance: PictureModel;

  constructor() {
    super(pictureModel);
  }

  /**
   * Single instance
   * @returns PictureModel
   */
  public static getInstance(): PictureModel {
    this._instance || (this._instance = new PictureModel());
    return this._instance;
  }
}
