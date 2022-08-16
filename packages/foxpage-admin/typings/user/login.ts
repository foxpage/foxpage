import { ResponseBody } from '@/types/common';

import { Creator } from './user';

export interface LoginUser extends Creator {
  changePwdStatus?: boolean;
  organizationId: string;
}

export interface LoginOptionsAction<P = unknown> {
  onSuccess?(res?: P): void;
  onFail?(): void;
}

export interface LoginParams extends LoginOptionsAction<LoginReturn> {
  account: string;
  password: string;
}

export interface LoginReturn {
  token: string;
  userInfo: LoginUser;
  languagePrefer?: string;
  organizationPrefer?: string;
}

export interface LoginResponse extends ResponseBody<LoginReturn> {}
