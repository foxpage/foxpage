import {
  GoodsAddParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  StoreResourceSearchParams,
  StoreResourceSearchResult,
} from '@/types/store';
import FoxpageApi from '@/utils/foxpage-api-sdk';

import { ApplicationStoreGoodsSearchParams } from '../../../typings/builder/template-select';

export const fetchStoreProjectResources = (params: StoreResourceSearchParams): Promise<StoreResourceSearchResult> =>
  new Promise(resolve => {
    FoxpageApi.post('/stores/project-searchs', params, (rs: StoreResourceSearchResult) => {
      resolve(rs);
    });
  });

export const fetchStorePackageResources = (params: StoreResourceSearchParams): Promise<StoreResourceSearchResult> =>
  new Promise(resolve => {
    FoxpageApi.post('/stores/package-searchs', params, (rs: StoreResourceSearchResult) => {
      resolve(rs);
    });
  });

export const addPageGoods = (params: GoodsAddParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/stores/pages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const addPackageGoods = (params: GoodsAddParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/stores/packages', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const commitToStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.post('/stores/goods', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const offlineFromStore = (params: GoodsOfflineParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.put('/stores/goods-offline', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchApplicationStoreProjectGoods = (params: ApplicationStoreGoodsSearchParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications/project-goods-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const fetchApplicationStorePackageGoods = (params: ApplicationStoreGoodsSearchParams): Promise<ResponseBody> =>
  new Promise(resolve => {
    FoxpageApi.get('/applications/package-goods-searchs', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
