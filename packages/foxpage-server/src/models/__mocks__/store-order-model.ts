import { BaseModel } from './base-model';

export class StoreOrderModel extends BaseModel {
  private static _instance: StoreOrderModel;

  constructor() {
    super();
  }

  public static getInstance(): StoreOrderModel {
    this._instance || (this._instance = new StoreOrderModel());
    return this._instance;
  }
}
