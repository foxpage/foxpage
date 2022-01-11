import { Creator, OptionsAction, OrganizationUser, PaginationReqParams, ResponseBody } from '@/types/index';

export interface Team {
  id: string;
  name: string;
  members: OrganizationUser[];
  creator: Creator;
  createTime: string;
  updateTime: string;
}

export interface TeamFetchParams {
  organizationId: string;
  page: number;
  size: number;
}
export interface TeamFetchResponse extends ResponseBody {
  data?: Team[];
}

export interface TeamAddParams {
  organizationId: string;
  name: string;
}

export interface TeamUpdateParams {
  teamId: string;
  name: string;
}

export interface TeamDeleteParams {
  teamId: string;
  status: boolean;
}

export interface TeamUsersAddReqParams {
  teamId: string;
  userIds: string[];
}

export interface TeamUsersAddParams extends OptionsAction {
  teamId: string;
  users: OrganizationUser[];
}

export interface TeamUsersFetchParams extends PaginationReqParams {
  teamId: string;
}
