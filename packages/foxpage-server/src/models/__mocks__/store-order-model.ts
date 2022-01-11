import { BaseModelAbstract } from './abstracts/base-model-abstract';

export class StoreOrderModel extends BaseModelAbstract {
  private static _instance: StoreOrderModel;

  constructor() {
    super();
  }

  public static getInstance(): StoreOrderModel {
    this._instance || (this._instance = new StoreOrderModel());
    return this._instance;
  }
}
