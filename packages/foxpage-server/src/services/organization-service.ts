import _ from 'lodash';

import { Member, Organization } from '@foxpage/foxpage-server-types';

import * as Model from '../models';
import { FoxCtx, IdName, MemberInfo, PageList, Search } from '../types/index-types';
import { OrgBaseInfo, OrgInfo } from '../types/organization-types';

import { BaseService } from './base-service';
import * as Service from './index';

export class OrgService extends BaseService<Organization> {
  private static _instance: OrgService;

  constructor() {
    super(Model.org);
  }

  /**
   * Single instance
   * @returns OrgService
   */
  public static getInstance (): OrgService {
    this._instance || (this._instance = new OrgService());
    return this._instance;
  }

  /**
   * Get user organization list
   * @param userId 
   * @returns 
   */
  async getUserOrg (userId: string): Promise<IdName[]> {
    const orgList = await this.find({ 'members.userId': userId, 'members.status': true });
    return _.map(orgList, org => _.pick(org, ['id', 'name']));
  }

  /**
   * Get organization paging data
   * @param  {Search} params
   * @returns {PageList<OrgInfo>} Promise
   */
  async getPageList (params: Search): Promise<PageList<OrgInfo>> {
    Service.application.setPageSize(params);

    const [orgList, orgCount] = await Promise.all([
      Model.org.getPageList(params),
      Model.org.getCount(params),
    ]);

    // Get user information corresponding to the organization
    const newOrgList = await this.replaceOrgUserInfo(orgList);

    return {
      pageInfo: { page: params.page || 1, size: params.size || 20, total: orgCount },
      data: newOrgList,
    };
  }

  /**
   * Obtain information about the creator and organization member of the
   * replacement organization through the organization details
   * @param  {Organization[]} orgList
   * @returns {OrgInfo[]} Promise
   */
  async replaceOrgUserInfo (orgList: Organization[]): Promise<OrgInfo[]> {
    if (orgList.length === 0) {
      return [];
    }

    let userIds: string[] = [];
    orgList.forEach((org) => {
      userIds = _.merge(userIds, org.creator, _.map(org.members, 'userId'));
    });

    // Get user information
    const userObject = await Service.user.getUserBaseObjectByIds(userIds);

    let newOrgList: OrgInfo[] = [];
    orgList.map((org) => {
      const orgItem = Object.assign(_.omit(org, 'creator'), {
        creator: userObject[org.creator],
      }) as OrgInfo;

      if (orgItem.members && orgItem.members.length > 0) {
        orgItem.members.map((member: MemberInfo) => {
          member.account = userObject[member.userId].account;
        });
      }

      newOrgList.push(orgItem);
    });

    return newOrgList;
  }

  /**
   * Get a list of members of the specified organization
   * @param  {string} id
   * @returns {Member[]} Promise
   */
  async getMembersById (id: string): Promise<Member[]> {
    const orgDetail = await this.getDetailById(id);

    return orgDetail && orgDetail.members ? orgDetail.members : [];
  }

  /**
   * Get the organization information to which the specified user belongs
   * @param  {string} userId
   * @returns Promise
   */
  async getUserOrgById (userId: string): Promise<OrgBaseInfo> {
    const orgList = await this.getUserOrg(userId);
    return orgList[0] || {};
  }

  /**
   * Check user info in org members
   * @param organizationId 
   * @param userId 
   * @returns 
   */
  async checkUserIdInOrg (organizationId: string, userId: string): Promise<Partial<Member>> {
    let orgMember: Partial<Member> = {};
    const orgDetail = await this.getDetailById(organizationId);
    if (orgDetail && !orgDetail.deleted) {
      orgDetail.members?.map(member => {
        if (member.userId === userId) {
          orgMember = member;
        }
      });
    }

    return orgMember;
  }

  /**
   * Check whether the specified user is in the specified organization, the current user is the default
   * @param  {string} organizationId
   * @returns Promise
   */
  async checkUserInOrg (organizationId: string, userId: string): Promise<boolean> {
    const memberUser = await this.checkUserIdInOrg(organizationId, userId);
    return memberUser.status === true;
  }

  /**
   * Check if the component id exists
   * @param  {string} organizationId
   * @returns Promise
   */
  async checkOrgValid (organizationId: string): Promise<boolean> {
    const orgDetail = await this.getDetailById(organizationId);
    return orgDetail && orgDetail.deleted === false;
  }

  /**
   * Add new organization user
   * @param  {string} organizationId
   * @param  {string[]} userIds
   * @returns Member
   */
  addNewMembers (organizationId: string, userIds: string[], options: { ctx: FoxCtx }): Member[] {
    const members: Member[] = userIds.map((userId) => {
      return { userId, status: true, joinTime: new Date() };
    });

    if (organizationId && members.length > 0) {
      options.ctx.transactions.push(
        Model.org.updateDetailQuery(organizationId, { $push: { members } } as any),
      );
    }

    return members;
  }

  /**
   * Update the status of organization members
   * @param  {string} organizationId
   * @param  {string[]} userIds
   * @param  {boolean} status
   */
  updateMembersStatus (
    organizationId: string,
    userIds: string[],
    status: boolean,
    options: { ctx: FoxCtx },
  ): void {
    options.ctx.transactions.push(
      Model.org.batchUpdateDetailQuery({ id: organizationId, 'members.userId': { $in: userIds } }, {
        $set: { 'members.$.status': status },
      } as any),
    );
  }
}
