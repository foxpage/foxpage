import {
  DynamicFetchParams,
  DynamicFetchResponse,
  RecycleFetchParams,
  RecycleFetchResponse,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const searchRecycles = (params: RecycleFetchParams): Promise<RecycleFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/workspaces/recycle-searchs', params, (rs: RecycleFetchResponse) => {
      resolve(rs);
    });
  });

export const searchDynamics = (params: DynamicFetchParams): Promise<DynamicFetchResponse> =>
  new Promise((resolve) => {
    FoxPageApi.get('/workspaces/dynamic-searchs', params, (rs: DynamicFetchResponse) => {
      resolve(rs);
    });
  });
