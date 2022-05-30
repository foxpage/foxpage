import {
  AuthorizeAddParams,
  AuthorizeAddRes,
  AuthorizeDeleteParams,
  AuthorizeDeleteRes,
  AuthorizeListFetchParams,
  AuthorizeListFetchRes,
  AuthorizeUpdateParams,
  AuthorizeUpdateRes,
  AuthorizeUserFetchParams,
  AuthorizeUserFetchRes,
} from '@/types/auth';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const authorizeFetch = (params: AuthorizeListFetchParams): Promise<AuthorizeListFetchRes> =>
  new Promise((resolve) => {
    FoxpageApi.get('/authorizes', params, (rs: AuthorizeListFetchRes) => {
      resolve(rs);
    });
  });

export const authorizeAdd = (params: AuthorizeAddParams): Promise<AuthorizeAddRes> =>
  new Promise((resolve) => {
    FoxpageApi.post('/authorizes', params, (rs: AuthorizeAddRes) => {
      resolve(rs);
    });
  });

export const authorizeUpdate = (params: AuthorizeUpdateParams): Promise<AuthorizeUpdateRes> =>
  new Promise((resolve) => {
    FoxpageApi.put('/authorizes', params, (rs: AuthorizeUpdateRes) => {
      resolve(rs);
    });
  });

export const authorizeDelete = (params: AuthorizeDeleteParams): Promise<AuthorizeDeleteRes> =>
  new Promise((resolve) => {
    FoxpageApi.put('/authorizes/status', params, (rs: AuthorizeDeleteRes) => {
      resolve(rs);
    });
  });

export const authorizeUserFetch = (params: AuthorizeUserFetchParams): Promise<AuthorizeUserFetchRes> =>
  new Promise((resolve) => {
    FoxpageApi.get('/user-searchs', params, (rs: AuthorizeUserFetchRes) => {
      resolve(rs);
    });
  });
