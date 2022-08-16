import { StoreOrder } from '@foxpage/foxpage-server-types';

import storeOrderModel from './schema/store-order';
import { BaseModel } from './base-model';

/**
 * Store product order data model
 *
 * @export
 * @class StoreOrderModel
 * @extends {BaseModel<StoreOrder>}
 */
export class StoreOrderModel extends BaseModel<StoreOrder> {
  private static _instance: StoreOrderModel;

  constructor() {
    super(storeOrderModel);
  }

  /**
   * Single instance
   * @returns StoreOrderModel
   */
  public static getInstance(): StoreOrderModel {
    this._instance || (this._instance = new StoreOrderModel());
    return this._instance;
  }
}
