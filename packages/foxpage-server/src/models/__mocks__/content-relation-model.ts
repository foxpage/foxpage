import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class RelationModel extends BaseModelAbstract {
  private static _instance: RelationModel;

  constructor() {
    super();
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
