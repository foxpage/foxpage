import { OptionsAction } from '@/types/index';

export interface User { }

export interface Creator {
  account: string;
  email: string;
  id: string;
}

export interface UserInfoType extends Creator {
  organizationId: string;
  nickName: string;
}

export interface LoginUser extends User {
  token: string;
  organizationId: string;
  userInfo: UserInfoType;
}

export interface UserLoginResult {
  token: string;
  userInfo: UserInfoType;
}

export interface UserRegisterResult extends UserLoginResult {

}


export interface UserLoginParams extends OptionsAction<UserLoginResult> {
  account: string;
  password: string;
}

export interface UserRegisterParams extends OptionsAction {
  account: string;
  email: string;
  password: string;
}