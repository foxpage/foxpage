import _ from 'lodash';

import { Member, Team } from '@foxpage/foxpage-server-types';

import * as Model from '../models';
import { FoxCtx, PageData } from '../types/index-types';
import { SearchTeamExist, TeamInfo, TeamSearch } from '../types/team-types';

import { BaseService } from './base-service';
import * as Service from './index';

export class TeamService extends BaseService<Team> {
  private static _instance: TeamService;

  constructor() {
    super(Model.team);
  }

  /**
   * Single instance
   * @returns TeamService
   */
  public static getInstance(): TeamService {
    this._instance || (this._instance = new TeamService());
    return this._instance;
  }

  /**
   * Check if the team already exists
   * @param  {SearchTeamExist} params
   * @returns {boolean} Promise
   */
  async checkTeamExist(params: SearchTeamExist): Promise<boolean> {
    const team = await this.model.findOne({
      name: params.name,
      organizationId: params.organizationId,
      deleted: false,
    });
    return team !== null;
  }

  /**
   * Get team paging data
   * @param  {TeamSearch} params
   * @returns {PageList<TeamInfo>} Promise
   */
  async getPageList(params: TeamSearch): Promise<PageData<TeamInfo>> {
    Service.team.setPageSize(params);

    const [teamList, teamCount] = await Promise.all([
      Model.team.getPageList(params),
      Model.team.getCount(params),
    ]);

    // Get user information corresponding to the organization
    let pageTeamList: TeamInfo[] = [];
    if (teamList.length > 0) {
      // Get the UserId including the members of the organization creator
      const userIds: string[] = _.map(teamList, 'creator');

      // Get user information
      const userObject = await Service.user.getUserBaseObjectByIds(userIds);

      // Filter out effective members and count
      pageTeamList = teamList.map((team) => {
        return Object.assign(_.omit(team, 'creator', 'members'), {
          creator: userObject[team.creator],
          memberCount: _.filter(team.members, ['status', true]).length || 0,
        }) as TeamInfo;
      });
    }

    return { count: teamCount, list: pageTeamList };
  }

  /**
   * Get a list of members of the specified team
   * @param  {string} id
   * @returns {Member[]} Promise
   */
  async getMembersById(id: string): Promise<Member[]> {
    const teamDetail = await this.model.findOne({ id });

    return teamDetail?.members || [];
  }

  /**
   * Update the status of team members
   * @param  {string} teamId
   * @param  {string[]} userIds
   * @param  {boolean} status
   */
  updateMembersStatus(teamId: string, userIds: string[], options: { ctx: FoxCtx; status: boolean }): void {
    const status = options.status || false;
    options.ctx.transactions.push(
      Model.team.batchUpdateDetailQuery({ id: teamId, 'members.userId': { $in: userIds } }, {
        $set: { 'members.$.status': status },
      } as any),
    );
  }

  /**
   * Get and specify the member information of the user in the same team
   * @param userId
   * @param teamIds
   * @returns
   */
  async getSameTeamUsers(userId: string, teamIds?: string[]): Promise<string[]> {
    let userIds: string[] = [];
    let searchParams: Record<string, any> = {
      members: { $elemMatch: { $and: [{ 'members.userId': userId, status: true }] } },
      deleted: false,
    };

    if (teamIds && teamIds.length > 0) {
      searchParams.id = { $in: teamIds };
    }

    const teamList = await this.find(searchParams, 'members');
    teamList.forEach(team => {
      (team.members || []).forEach(member => {
        member.status && userIds.push(member.userId);
      });
    });

    return _.uniq(userIds);
  }
}
