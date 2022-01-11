import { StoreOrder } from '@foxpage/foxpage-server-types';

import { BaseModelAbstract } from './abstracts/base-model-abstract';
import storeOrderModel from './schema/store-order';

/**
 * Store product order data model
 *
 * @export
 * @class StoreOrderModel
 * @extends {BaseModelAbstract<StoreOrder>}
 */
export class StoreOrderModel extends BaseModelAbstract<StoreOrder> {
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
