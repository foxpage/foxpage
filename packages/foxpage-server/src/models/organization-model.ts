import { Organization } from '@foxpage/foxpage-server-types';

import { Search } from '../types/index-types';

import orgModel from './schema/organization';
import { BaseModel } from './base-model';

/**
 * Organize related data model
 *
 * @export
 * @class OrgModel
 * @extends {BaseModel<Organization>}
 */
export class OrgModel extends BaseModel<Organization> {
  private static _instance: OrgModel;

  constructor() {
    super(orgModel);
  }

  /**
   * Single instance
   * @returns OrgModel
   */
  public static getInstance(): OrgModel {
    this._instance || (this._instance = new OrgModel());
    return this._instance;
  }

  /**
   * Get organization paging data
   * @param  {Search} params
   * @returns {Organization[]} Promise
   */
  async getPageList(params: Search): Promise<Organization[]> {
    const page = params.page || 1;
    const size = params.size || 20;
    const from = (page - 1) * size;

    const searchParams: { $or?: any[]; deleted: boolean } = { deleted: false };
    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    return this.model
      .find(searchParams, '-_id -members._id')
      .sort({ _id: -1 })
      .skip(from)
      .limit(size)
      .lean();
  }

  /**
   * Get the total number of organizations
   * @param  {Search} params
   * @returns {number} Promise
   */
  async getCount(params: Search): Promise<number> {
    const searchParams: { $or?: any[]; deleted: boolean } = { deleted: false };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    return this.model.countDocuments(searchParams);
  }
}
