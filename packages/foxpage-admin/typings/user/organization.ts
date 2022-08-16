import { ResponseBody, TeamMemberEntity } from '@/types/index';

export interface AddOrganizationUserParams {
  organizationId: string;
  account: string;
}

export interface DeleteOrganizationUserParams {
  organizationId: string;
  userIds: string[];
}

export interface OrganizationUserFetchResponse extends ResponseBody {
  data?: TeamMemberEntity[];
}
