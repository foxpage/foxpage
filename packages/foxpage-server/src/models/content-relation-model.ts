import { ContentRelation } from '@foxpage/foxpage-server-types';

import { BaseModelAbstract } from './abstracts/base-model-abstract';
import relationModel from './schema/content-relation';

/**
 *relation repository
 *
 * @export
 * @class FileModel
 * @extends {BaseModelAbstract<File>}
 */
export class RelationModel extends BaseModelAbstract<ContentRelation> {
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
