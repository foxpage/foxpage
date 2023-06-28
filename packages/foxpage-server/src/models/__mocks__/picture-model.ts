import { BaseModel } from './base-model';

export class PictureModel extends BaseModel {
  private static _instance: PictureModel;

  constructor() {
    super();
  }

  public static getInstance(): PictureModel {
    this._instance || (this._instance = new PictureModel());
    return this._instance;
  }
}
