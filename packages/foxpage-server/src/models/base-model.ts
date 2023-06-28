import './schema/';

import _ from 'lodash';
import mongoose from 'mongoose';

import { DateTime } from '@foxpage/foxpage-shared';

import { DBQuery, SearchModel } from '../types/index-types';

export class BaseModel<T> {
  protected model: mongoose.Model<T>;
  protected ignoreFields: string = ' -_id -members._id -tags._id -host._id -resources._id -category._id';

  constructor(model: mongoose.Model<T>) {
    this.model = model;
  }

  /**
   * queries: [
   *   {type:'update', model: Object, data:[{},{}]
   *   {type:'insert', model: Object, data: {}|[]}
   * ]
   */
  async exec(queries: any): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction(); // { writeConcern: { w: 2 } }

    try {
      for (const query of queries) {
        if (query.type === 'update') {
          await query.model.updateMany(...query.data, { session });
        } else if (query.type === 'insert') {
          await query.model.insertMany(_.isArray(query.data) ? query.data : [query.data], {
            session,
          });
        }
      }
      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      console.log(error);
      throw new Error('Run mongo transaction error:' + (<Error>error).message);
    }
  }

  /**
   * Query list
   * @param  {SearchModel} params
   * @returns Promise
   */
  async getList(params: SearchModel): Promise<T[]> {
    const search: object = params.search || {};
    const page: number = (params && params.page) || 1;
    const size: number = (params && params.size) || 10;
    const from: number = (page - 1) * size;

    return this.model
      .find(search, this.ignoreFields, {
        sort: { _id: -1 },
        skip: from,
        limit: size,
      })
      .lean();
  }

  /**
   * Find details by a single ID
   * @param  {string} objectId
   * @returns Promise
   */
  async getById(objectId: string): Promise<T> {
    return this.model.findById(objectId).lean();
  }

  /**
   * Get the number of data for the specified filter condition
   * @param  {mongoose.FilterQuery<T>} filter
   * @returns Promise
   */
  async getCountDocuments(filter: mongoose.FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  /**
   * Query data with custom conditions
   * @param  {mongoose.FilterQuery<T>} filter
   * @param  {Object={}} projection
   * @param  {mongoose.QueryOptions={}} options
   * @returns Promise
   */
  async find(
    filter: mongoose.FilterQuery<T>,
    projection: string = '',
    options: mongoose.QueryOptions = {},
  ): Promise<T[]> {
    projection = projection || this.ignoreFields;
    !options.sort && (options.sort = { _id: -1 });
    return this.model.find(filter, projection, options).lean();
  }

  /**
   * Find a single record by condition
   * @param  {mongoose.FilterQuery<T>} condition
   * @param  {Object} projection?
   * @param  {mongoose.QueryOptions} options?
   * @returns Promise
   */
  async findOne(
    condition: mongoose.FilterQuery<T>,
    projection: string = '',
    options: mongoose.QueryOptions = {},
  ): Promise<T> {
    projection = projection || this.ignoreFields;
    return this.model.findOne(condition, projection, options).lean();
  }

  /**
   * Get details by Id
   * @param  {string[]} objectIds
   * @returns Promise
   */
  async getDetailByIds(objectIds: string[], projection: string = ''): Promise<T[]> {
    projection = projection || this.ignoreFields;
    return this.model.find({ id: { $in: objectIds } } as any, projection, {}).lean();
  }

  /**
   * Query to generate new data
   * @param  {T} detail
   */
  addDetailQuery(detail: T | T[]): DBQuery {
    return { type: 'insert', model: this.model, data: detail };
  }

  /**
   * Create data
   * @param  {T|T[]} detail
   * @returns Promise
   */
  async addDetail(detail: T | T[], options: mongoose.SaveOptions = {}): Promise<T[]> {
    const data: T[] = detail instanceof Array ? detail : [detail];
    return this.model.create(data, options);
  }

  /**
   * Generate query to update data
   * @param  {string} id
   * @param  {Partial<T&CommonFields>} data
   */
  updateDetailQuery(id: string, data: Partial<T>): DBQuery {
    return {
      type: 'update',
      model: this.model,
      data: [{ id }, Object.assign({ updateTime: new DateTime() }, data)],
    };
  }

  /**
   * Update data
   * @param  {mongoose.FilterQuery<T>} filter
   * @param  {mongoose.UpdateQuery<T>} doc
   * @returns Promise
   */
  async updateDetail(filter: mongoose.FilterQuery<T>, doc: mongoose.UpdateQuery<T>): Promise<any> {
    return this.model.updateMany(filter, doc);
  }

  /**
   * Bulk settings update
   * @param  {Record<string} filter
   * @param  {} any>
   * @param  {Partial<T&CommonFields>} data
   * @returns void
   */
  batchUpdateDetailQuery(filter: Record<string, any>, data: Partial<T>): DBQuery {
    return {
      type: 'update',
      model: this.model,
      data: [filter, Object.assign({ updateTime: new DateTime() }, data)],
    };
  }

  /**
   * Set data status
   * @param  {string} id
   * @param  {boolean} status
   * @returns Promise
   */
  async setDeleteStatus(ids: string | string[], status: boolean): Promise<any> {
    return this.model.updateMany(
      { id: { $in: ids } } as mongoose.FilterQuery<{}>,
      { deleted: status } as mongoose.UpdateQuery<{}>,
    );
  }

  /**
   * Delete collection data
   * @param  {mongoose.FilterQuery<T>} filter
   * @returns Promise
   */
  async deleteDetail(filter: mongoose.FilterQuery<T>): Promise<any> {
    return this.model.deleteMany(filter);
  }

  /**
   * query aggregate data list
   * @param  {any={}} params
   * @returns Promise
   */
  async aggregate(params: any = {}): Promise<any> {
    return this.model.aggregate(params);
  }

  /**
   * get the distinct field values
   * @param fieldId
   * @param filter
   * @returns
   */
  async distinct(fieldId: string, filter?: mongoose.FilterQuery<T>): Promise<any> {
    return this.model.distinct(fieldId, filter);
  }
}
