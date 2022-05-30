import { OptionsAction } from '@/types/index';

export interface User {
  id: string;
  account: string;
  type: string;
}

export interface Creator {
  account: string;
  email: string;
  id: string;
}

export interface UserInfoType extends Creator {
  changePwdStatus: boolean;
  nickName: string;
  organizationId: string;
}

export interface LoginUser {
  token: string;
  organizationId: string;
  userInfo: UserInfoType;
  languagePrefer?: string;
}

export interface UserLoginResult {
  token: string;
  userInfo: UserInfoType;
}

export interface UserRegisterResult extends UserLoginResult {}

export interface UserLoginParams extends OptionsAction<UserLoginResult> {
  account: string;
  password: string;
}

export interface UserRegisterParams extends OptionsAction {
  account: string;
  email: string;
  password: string;
}

export interface UserOrganization {
  name: string;
  id: string;
}

export interface UserOrganizationList {
  organizations: UserOrganization[];
}
