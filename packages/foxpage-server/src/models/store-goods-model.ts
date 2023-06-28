import * as mongoose from 'mongoose';

import { StoreGoods } from '@foxpage/foxpage-server-types';

import { StorePageParams } from '../types/store-types';

import storeGoodsModel from './schema/store-goods';
import { BaseModel } from './base-model';

/**
 * Store product data model
 *
 * @export
 * @class StoreGoodsModel
 * @extends {BaseModel<StoreGoods>}
 */
export class StoreGoodsModel extends BaseModel<StoreGoods> {
  private static _instance: StoreGoodsModel;

  constructor() {
    super(storeGoodsModel);
  }

  /**
   * Single instance
   * @returns StoreGoodsModel
   */
  public static getInstance(): StoreGoodsModel {
    this._instance || (this._instance = new StoreGoodsModel());
    return this._instance;
  }

  /**
   * Get a list of store pagination data
   * @param  {StorePageParams} params
   * @returns Promise
   */
  async getGoodsPageList(params: StorePageParams): Promise<StoreGoods[]> {
    const page = params.page || 1;
    const size = params.size || 20;
    const from = (page - 1) * size;

    const searchParams: {
      status: number;
      deleted: boolean;
      type?: any;
      name?: any;
      'details.applicationId'?: any;
    } = {
      status: 1,
      deleted: false,
    };

    if (params.search) {
      searchParams.name = { $regex: new RegExp(params.search, 'i') };
    }

    if (params.type) {
      searchParams.type = params.type;
    }

    if (params.appIds && params.appIds.length > 0) {
      searchParams['details.applicationId'] = { $in: params.appIds };
    }

    return this.model
      .find(searchParams as mongoose.FilterQuery<StoreGoods>, '-_id')
      .sort({ createTime: -1 })
      .skip(from)
      .limit(size)
      .lean();
  }

  /**
   * Get the amount of store goods data
   * @param  {StorePageParams} params
   * @returns Promise
   */
  async getGoodsCount(params: StorePageParams): Promise<number> {
    const searchParams: {
      status: number;
      deleted: boolean;
      type?: any;
      name?: any;
      'details.applicationId'?: any;
    } = {
      status: 1,
      deleted: false,
    };

    if (params.search) {
      searchParams.name = { $regex: new RegExp(params.search, 'i') };
    }

    if (params.type) {
      searchParams.type = params.type;
    }

    if (params.appIds && params.appIds.length > 0) {
      searchParams['details.applicationId'] = { $in: params.appIds };
    }

    return this.model.countDocuments(searchParams as mongoose.FilterQuery<StoreGoods>);
  }
}
