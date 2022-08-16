import { BaseModel } from './base-model';

export class StoreGoodsModel extends BaseModel {
  private static _instance: StoreGoodsModel;

  constructor() {
    super();
  }

  public static getInstance(): StoreGoodsModel {
    this._instance || (this._instance = new StoreGoodsModel());
    return this._instance;
  }

  getGoodsPageList() {
    return [];
  }

  getGoodsCount() {
    return 1;
  }
}
