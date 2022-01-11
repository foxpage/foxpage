import {
  FuncDeleteParams,
  FuncDeleteRes,
  FuncFetchParams,
  FuncFetchRes,
  FuncNewParams,
  FuncNewRes,
  FuncUpdateParams,
  FuncUpdateRes,
} from '@/types/application/function';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const getFunctions = (params: FuncFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/function-searchs', params, (rs: FuncFetchRes) => {
      resolve(rs);
    });
  });

export const getApplicationFunctions = (params: FuncFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/functions/file-searchs', params, (rs: FuncFetchRes) => {
      resolve(rs);
    });
  });

export const addFunction = (params: FuncNewParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/functions', params, (rs: FuncNewRes) => {
      resolve(rs);
    });
  });

export const updateFunction = (params: FuncUpdateParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/functions', params, (rs: FuncUpdateRes) => {
      resolve(rs);
    });
  });

export const deleteFunction = (params: FuncDeleteParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/functions/status', params, (rs: FuncDeleteRes) => {
      resolve(rs);
    });
  });
