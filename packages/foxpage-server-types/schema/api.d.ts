import { Application, AppResource, User } from './index';

interface PageInfo {
  page: number;
  size: number;
  total: number;
}

export interface UsersLoginReq {
  account: string;
  password: string;
  options?: Record<string, any>;
}

export interface UsersLoginRes {
  userInfo: Partial<User>;
  token: string;
}

export interface UserRegisterReq {
  account: string;
  email: string;
  password: string;
}

export interface UserRegisterRes {
  id: string;
  account: string;
  email: string;
}

export interface AddApplicationReq {
  name: string;
  organizationId: string;
  intro?: string;
  host?: string[];
  slug?: string;
  locale?: string[];
  resource?: AppResource[];
}

export type AddApplicationRes = Application;

export interface GetApplicationDetailReq {
  applicationId: string;
}

export type GetApplicationDetailRes = Application;

export interface GetApplicationListReq {
  organizationId: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface GetApplicationListRes {
  data: Application[];
  pageInfo: PageInfo;
}

export interface GetMultiApplicationDetailReq {
  applicationIds: string[];
}

export type GetMultiApplicationDetailRes = Application[];

export interface GetApplicationResourceReq {
  applicationId: string;
  type?: string;
}

export type GetApplicationResourceRes = AppResource[];
