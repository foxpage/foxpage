import _ from 'lodash';
import mongoose from 'mongoose';
import pLimit from 'p-limit';

import { DateTime } from '@foxpage/foxpage-shared';

import { BaseModel } from '../models/base-model';
import { DBQuery, PageSize, SearchModel } from '../types/index-types';

export class BaseService<T> {
  public model: BaseModel<T>;

  constructor(model: BaseModel<T>) {
    this.model = model;
  }

  async runTransaction(queries?: any[]): Promise<void> {
    await this.model.exec(queries);
  }

  /**
   * Check item detail is not valid: item is empty or item.deleted is true
   * @param item
   * @returns
   */
  notValid(item: Record<string, any>): boolean {
    return _.isEmpty(item) || item.deleted;
  }

  /**
   * Set the default value of the paging parameters
   * @param  {Partial<PageSize>} params
   * @returns Partial
   */
  setPageSize(params: Partial<PageSize>): PageSize {
    params.page = Number(params.page) || 1;
    params.size = Number(params.size) || 10;

    return { page: params.page, size: params.size };
  }

  /**
   * Search data list
   * @param  {SearchModel} params
   * @returns Promise
   */
  async getList(params: SearchModel): Promise<T[]> {
    return this.model.getList(params);
  }

  /**
   * Get the number of data with specified conditions
   * @param  {any} params
   * @returns Promise
   */
  async getCount(params: any): Promise<number> {
    return this.model.getCountDocuments(params);
  }

  /**
   * Get data through custom parameters
   * @param  {any} params
   * @returns Promise
   */
  async find(params: any, projection?: string, options?: Record<string, any>): Promise<T[]> {
    if (!options) {
      options = {};
    }

    if (!options.sort) {
      options.sort = { _id: -1 };
    }

    return this.model.find(params, projection, options);
  }

  /**
   * Find data by multiple IDs
   * @param  {string[]} objectIds
   * @returns Promise
   */
  async getDetailByIds(objectIds: string[], projection?: string): Promise<T[]> {
    if (objectIds.length === 0) {
      return [];
    }

    objectIds = _.uniq(objectIds);

    // Batch query, 1 concurrent request, 200 ids each time
    let promises: any[] = [];
    const limit = pLimit(1);
    _.chunk(objectIds, 200).forEach((ids) => {
      promises.push(limit(() => this.model.getDetailByIds(ids, projection)));
    });

    return _.flatten(await Promise.all(promises));
  }

  /**
   * Get data list, and response format to object
   * @param  {string[]} objectIds
   * @param  {string} projection?
   * @returns Promise
   */
  async getDetailObjectByIds(objectIds: string[], projection?: string): Promise<Record<string, T>> {
    if (objectIds.length === 0) {
      return {};
    }
    const objectList = await this.getDetailByIds(objectIds, projection);
    return _.keyBy(objectList, 'id') as Record<string, T>;
  }

  /**
   * Query data arbitrarily
   * @param  {T} paramsT
   * @returns Promise
   */
  async getDetail(params: mongoose.FilterQuery<T>): Promise<T> {
    const itemDetail = this.model.findOne(params);
    return itemDetail || <T>{};
  }

  /**
   * Find data by a single ID
   * @param  {string} objectId
   * @returns Promise
   */
  async getDetailById(objectId: string): Promise<T> {
    const itemDetail = await this.model.findOne({ id: objectId } as mongoose.FilterQuery<{}>);
    return itemDetail || <T>{};
  }

  /**
   * Query to generate new data
   * @param  {T} detail
   */
  addDetailQuery(detail: T | T[]): DBQuery {
    return this.model.addDetailQuery(detail);
  }

  /**
   * Create data
   * @param  {T} detail
   * @returns Promise
   */
  addDetail(detail: T): Promise<T[]> {
    return this.model.addDetail(detail);
  }

  /**
   * Generate query to update data
   * @param  {string} id
   * @param  {Partial<T&CommonFields>} data
   */
  updateDetailQuery(id: string, data: Partial<T>): any {
    return this.model.updateDetailQuery(id, data);
  }

  /**
   * Bulk settings update
   * @param  {Record<string} filter
   * @param  {} any>
   * @param  {Partial<T&CommonFields>} data
   * @returns void
   */
  batchUpdateDetailQuery(filter: Record<string, any>, data: Partial<T>): any {
    return this.model.batchUpdateDetailQuery(filter, data);
  }

  /**
   * update data
   * @param  {string} id
   * @param  {Partial<T&CommonFields>} data
   * @returns Promise
   */
  async updateDetail(id: string, data: Partial<T>): Promise<any> {
    return this.model.updateDetail(
      { id } as mongoose.FilterQuery<{}>,
      Object.assign({ updateTime: new DateTime() }, data) as mongoose.UpdateQuery<T>,
    );
  }

  /**
   * batch update detail by ids
   * @param ids
   * @param data
   * @returns
   */
  async batchUpdateDetail(ids: string[], data: Partial<T>): Promise<any> {
    return this.model.updateDetail(
      { id: { $in: ids } } as mongoose.FilterQuery<{}>,
      Object.assign({ updateTime: new DateTime() }, data) as mongoose.UpdateQuery<T>,
    );
  }

  /**
   * Set data deletion status
   * @param  {string} id
   * @param  {boolean} status
   * @returns Promise
   */
  setDeleteStatus(ids: string | string[], status: boolean): any {
    if (typeof ids === 'string') {
      ids = [ids];
    }

    if (ids.length > 0) {
      return this.batchUpdateDetailQuery({ id: { $in: ids } }, { deleted: status } as any);
    }

    return {};
  }

  /**
   * Delete collection data
   * @param  {mongoose.FilterQuery<T>} params
   */
  deleteDetail(params: mongoose.FilterQuery<T>) {
    return this.model.deleteDetail(params);
  }

  /**
   * Check whether the data of the specified conditions exists
   * @param  {any} params
   * @returns Promise
   */
  async checkExist(params: any, id?: string): Promise<boolean> {
    const result: any = await this.model.findOne(params);
    return result ? result.id !== id : false;
  }

  /**
   * create aggregate query
   * @param params
   * @returns
   */
  async aggregate(params: any[]): Promise<any> {
    return this.model.aggregate(params);
  }

  /**
   * filter field id distinct data
   * @param fieldId
   * @param filter
   * @returns
   */
  async distinct(fieldId: string, filter: any): Promise<any> {
    return this.model.distinct(fieldId, filter);
  }
}
