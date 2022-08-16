import {
  FuncDeleteParams,
  FuncDeleteRes,
  FuncFetchParams,
  FuncFetchRes,
  FuncNewRes,
  FuncPublishParams,
  FuncSaveParams,
  FuncUpdateParams,
  FuncUpdateRes,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchFunctions = (params: FuncFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/function-searchs', params, (rs: FuncFetchRes) => {
      resolve(rs);
    });
  });

export const fetchAppFunctions = (params: FuncFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/functions/file-searchs', params, (rs: FuncFetchRes) => {
      resolve(rs);
    });
  });

export const addFunction = (params: FuncSaveParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/functions', params, (rs: FuncNewRes) => {
      resolve(rs);
    });
  });

export const updateFunction = (params: FuncUpdateParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/functions', params, (rs: FuncUpdateRes) => {
      resolve(rs);
    });
  });

export const deleteFunction = (params: FuncDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/functions/status', params, (rs: FuncDeleteRes) => {
      resolve(rs);
    });
  });

export const publishFunction = (params: FuncPublishParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/functions/version-publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
