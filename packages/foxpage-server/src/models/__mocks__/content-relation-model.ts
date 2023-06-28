import { BaseModel } from './base-model';

export class RelationModel extends BaseModel {
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
