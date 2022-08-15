/**
 * fox user
 */
export interface User {
  id: string;
  account: string;
  nickName?: string;
  email?: string;
  type?: string;
  organizationId?: string;
}

export type Creator = Pick<User, 'id' | 'account' | 'nickName'>;

export interface UserOrganization {
  name: string;
  id: string;
  default: boolean;
}

export interface UserOrganizationList {
  organizations: UserOrganization[];
}
