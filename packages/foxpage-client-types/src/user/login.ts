import { Creator } from './user';

export interface LoginUser extends Creator {
  changePwdStatus?: boolean;
  organizationId: string;
}

export interface LoginOptionsAction<P = unknown> {
  onSuccess?(res?: P): void;
  onFail?(): void;
}

export interface LoginReturn {
  token: string;
  userInfo: LoginUser;
  languagePrefer?: string;
  organizationPrefer?: string;
}
