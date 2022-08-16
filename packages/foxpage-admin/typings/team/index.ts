import {
  AbstractEntity,
  CommonDeleteParams,
  CommonFetchParams,
  PaginationReqParams,
  ResponseBody,
  User,
} from '@/types/index';

export interface TeamMemberEntity extends Pick<User, 'account'> {
  joinTime: string;
  status: boolean;
  userId: string;
}

export interface TeamEntity extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  deleted: boolean;
  members: TeamMemberEntity[];
  name: string;
  organizationId: string;
}

// team list
export interface TeamsFetchParams extends CommonFetchParams {}

export interface TeamsFetchResponse extends ResponseBody {
  data?: TeamEntity[];
}

declare interface TeamsCommonParams extends Pick<TeamEntity, 'name' | 'organizationId'> {
  teamId: string;
}

// team self
export type TeamAddParams = Pick<TeamsCommonParams, 'organizationId' | 'name'>;

export type TeamUpdateParams = Pick<TeamsCommonParams, 'teamId' | 'name'>;

export type TeamDeleteParams = Pick<TeamsCommonParams, 'teamId'> & Pick<CommonDeleteParams, 'status'>;

export interface TeamSaveParams extends Pick<TeamsCommonParams, 'organizationId'> {
  team: TeamEntity;
}

// team user
export type TeamMembersFetchParams = Pick<TeamsCommonParams, 'teamId'> & PaginationReqParams;

export interface TeamMembersUpdateParams extends Pick<TeamsCommonParams, 'teamId'> {
  userIds: string[];
}

export interface TeamMembersParams extends Pick<TeamsCommonParams, 'teamId'> {
  users: TeamMemberEntity[];
}
