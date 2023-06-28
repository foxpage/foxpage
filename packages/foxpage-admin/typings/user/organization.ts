import { ResponseBody, TeamMemberEntity } from '@foxpage/foxpage-client-types';

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
