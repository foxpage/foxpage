import { ContentRelation } from '@foxpage/foxpage-server-types';

import relationModel from './schema/content-relation';
import { BaseModel } from './base-model';

/**
 *relation repository
 *
 * @export
 * @class FileModel
 * @extends {BaseModel<File>}
 */
export class RelationModel extends BaseModel<ContentRelation> {
  private static _instance: RelationModel;

  constructor() {
    super(relationModel);
  }

  /**
   * Single instance
   * @returns RelationModel
   */
  public static getInstance(): RelationModel {
    this._instance || (this._instance = new RelationModel());
    return this._instance;
  }
}
