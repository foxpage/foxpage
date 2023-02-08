import {
  AuthorizeAddParams,
  AuthorizeAddResponse,
  AuthorizeDeleteParams,
  AuthorizeDeleteResponse,
  AuthorizeListFetchParams,
  AuthorizeListFetchResponse,
  AuthorizeQueryParams,
  AuthorizeUpdateParams,
  AuthorizeUpdateResponse,
  AuthorizeUserFetchParams,
  AuthorizeUserFetchRes,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const authorizeFetch = (params: AuthorizeListFetchParams): Promise<AuthorizeListFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/authorizes', params, (rs: AuthorizeListFetchResponse) => {
      resolve(rs);
    });
  });

export const authorizeAdd = (params: AuthorizeAddParams): Promise<AuthorizeAddResponse> =>
  new Promise((resolve) => {
    FoxPageApi.post('/authorizes', params, (rs: AuthorizeAddResponse) => {
      resolve(rs);
    });
  });

export const authorizeUpdate = (params: AuthorizeUpdateParams): Promise<AuthorizeUpdateResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/authorizes', params, (rs: AuthorizeUpdateResponse) => {
      resolve(rs);
    });
  });

export const authorizeDelete = (params: AuthorizeDeleteParams): Promise<AuthorizeDeleteResponse> =>
  new Promise((resolve) => {
    FoxPageApi.put('/authorizes/status', params, (rs: AuthorizeDeleteResponse) => {
      resolve(rs);
    });
  });

export const authorizeCheck = (params: AuthorizeQueryParams): Promise<any> =>
  new Promise((resolve) => {
    FoxPageApi.get('/authorizes/item', params, (rs: any) => {
      resolve(rs);
    });
  });

export const authorizeUserFetch = (params: AuthorizeUserFetchParams): Promise<AuthorizeUserFetchRes> =>
  new Promise((resolve) => {
    FoxPageApi.get('/user-searchs', params, (rs: AuthorizeUserFetchRes) => {
      resolve(rs);
    });
  });
