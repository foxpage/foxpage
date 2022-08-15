import {
  GoodsAddParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  GoodsSearchParams,
  ResponseBody,
  StoreResourceSearchParams,
  StoreResourceSearchResult,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchProjectResources = (
  params: StoreResourceSearchParams,
): Promise<StoreResourceSearchResult> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/project-searchs', params, (rs: StoreResourceSearchResult) => {
      resolve(rs);
    });
  });

export const fetchPackageResources = (
  params: StoreResourceSearchParams,
): Promise<StoreResourceSearchResult> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/package-searchs', params, (rs: StoreResourceSearchResult) => {
      resolve(rs);
    });
  });

export const fetchVariableResources = (
  params: StoreResourceSearchParams,
): Promise<StoreResourceSearchResult> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/goods-searchs', params, (rs: StoreResourceSearchResult) => {
      resolve(rs);
    });
  });

export const addPageGoods = (params: GoodsAddParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/pages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addPackageGoods = (params: GoodsAddParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/packages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addVariableGoods = (params: GoodsAddParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/items', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const commitToStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/goods', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const offlineFromStore = (params: GoodsOfflineParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/stores/goods-offline', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchApplicationStoreProjectGoods = (params: GoodsSearchParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications/project-goods-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchApplicationStorePackageGoods = (params: GoodsSearchParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.get('/applications/package-goods-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
