import { User } from '@foxpage/foxpage-server-types';

import { ServiceRes } from './index-types';

export type UserBase = Pick<User, 'id' | 'account' | 'nickName' | 'email'>;
export type NewUser = User & { password: string }; // 保存新用户数据字段
export type AddUserResData = Pick<User, 'account' | 'email' | 'password'>;
export type RegisterParams = LoginParams & {
  email: string;
  registerType: number;
  nickName?: string;
  changePwdStatus?: boolean;
  defaultOrganizationId?: string;
}; // 系统注册参数
export type RegisterServiceRes = ServiceRes & { data?: Partial<User> };

// 登录参数
export interface LoginParams {
  account: string;
  password: string;
  type?: string;
}

export interface ThirdLoginParams extends LoginParams {
  options?: any;
}

export interface UserAccountInfo {
  account: string;
  email?: string;
  department?: string;
  nickName?: string;
  organization?: string;
}
