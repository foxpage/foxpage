export interface OrganizationUser {
  joinTime?: string;
  userId: string;
  account: string;
}

export interface AddOrganizationUserParams {
  organizationId: string;
  account: string;
}

export interface DeleteOrganizationUserParams {
  organizationId: string;
  userIds: string[];
}

export interface OrganizationUserSearchParams {
  organizationId: string;
  page: number;
  size: number;
}

export interface OrganizationUserFetchResponse extends ResponseBody {
  data?: OrganizationUser[];
}
