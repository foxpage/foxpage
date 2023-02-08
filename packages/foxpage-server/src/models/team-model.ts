import { Team } from '@foxpage/foxpage-server-types';

import { TeamSearch } from '../types/team-types';

import teamModel from './schema/team';
import { BaseModel } from './base-model';

/**
 * Team related data model
 *
 * @export
 * @class TeamModel
 * @extends {BaseModel<Team>}
 */
export class TeamModel extends BaseModel<Team> {
  private static _instance: TeamModel;

  constructor() {
    super(teamModel);
  }

  /**
   * Single instance
   * @returns TeamModel
   */
  public static getInstance(): TeamModel {
    this._instance || (this._instance = new TeamModel());
    return this._instance;
  }

  /**
   * Get team paging data
   * @param  {TeamSearch} params
   * @returns {Team[]} Promise
   */
  async getPageList(params: TeamSearch): Promise<Team[]> {
    const page = params.page || 1;
    const size = params.size || 20;
    const from = (page - 1) * size;

    const searchParams: { organizationId: string; $or?: any[]; deleted: boolean } = {
      organizationId: params.organizationId,
      deleted: false,
    };
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
   * Get the counts of teams
   * @param  {TeamSearch} params
   * @returns {number} Promise
   */
  async getCount(params: TeamSearch): Promise<number> {
    const searchParams: { organizationId: string; $or?: any[]; deleted: boolean } = {
      organizationId: params.organizationId,
      deleted: false,
    };

    if (params.search) {
      searchParams['$or'] = [{ name: { $regex: new RegExp(params.search, 'i') } }, { id: params.search }];
    }

    return this.model.countDocuments(searchParams);
  }
}
