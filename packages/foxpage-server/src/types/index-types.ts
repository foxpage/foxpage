import { Context } from 'koa';

import { Member } from '@foxpage/foxpage-server-types';

export type PageList<T> = Pick<ResData<T>, 'pageInfo' | 'data'>;
export type TRecord<T> = Record<string, T>;

export interface FoxCtx extends Context {
  operations: any[];
  contentLogs: any[];
  transactions: any[];
  userInfo: {
    id: string;
    account: string;
  };
  logAttr: {
    id?: string;
    type?: string;
    method?: string;
    applicationId?: string;
    organizationId?: string;
    transactionId: string;
  };
  log: {
    requestTime: number;
    responseTime: number;
    tooks: number;
    originUrl: string;
    request?: any;
    response?: any;
    user: string;
  };
  request: any;
}

// Common response
export interface ResMsg {
  code: number;
  status?: number;
  msg?: string;
  data?: any;
}

export interface PageSize {
  page: number;
  size: number;
}

export interface PageInfo extends PageSize {
  total: number;
}

export interface ResData<T> extends ResMsg {
  data?: Object | T[];
  pageInfo?: PageInfo;
}

export interface ServiceRes {
  code: 0 | 1;
  msg?: string;
}

export interface Search extends Partial<PageSize> {
  deleted?: boolean;
  search?: string;
}

export interface SearchModel extends Partial<PageSize> {
  search?: object;
}

export interface Creator {
  id: string;
  account: string;
  nickName?: string;
  email?: string;
}

export interface Header {
  token: string;
  userInfo: Creator;
}

export interface IdName {
  id: string;
  name: string;
}

export interface TypeStatus {
  applicationId: string;
  id: string;
  status: boolean;
}

export interface PageData<T> {
  list: T[];
  count: number;
}

export interface MemberInfo extends Member {
  account?: string;
}

export interface NameVersion {
  name: string;
  version?: string;
}

export interface IdVersion {
  id: string;
  version: string;
}

export interface DBQuery {
  type: string;
  model: any;
  data: any;
}
