import VariableType, {
  GetApplicationVariableParams,
  GetApplicationVariableResult,
  VariablePublishParams,
  VariableSearchParams,
} from '@/types/application/variable';
import { BaseResponse, ResponseBody } from '@/types/common';
import { GoodsCommitParams } from '@/types/store';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const getApplicationVariables = (params: GetApplicationVariableParams) =>
  new Promise((resolve) => {
    FoxpageApi.get('/variables/file-searchs', params, (rs: GetApplicationVariableResult) => {
      resolve(rs);
    });
  });

export const getVariables = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.get('/variable-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });

export const getVariableBuildVersion = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.get('/variables/build-versions', params, (rs: any) => {
      resolve(rs);
    });
  });

export const addVariables = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.post('/variables', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updateVariables = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.put('/variables', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updateVariableContent = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.put('/variables/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

export const deleteVariable = (params: any) =>
  new Promise((resolve) => {
    FoxpageApi.put('/variables/status', params, (rs: any) => {
      resolve(rs);
    });
  });

export const searchVariable = (params: VariableSearchParams): Promise<BaseResponse<VariableType[]>> =>
  new Promise((resolve) => {
    FoxpageApi.post('/variables/scope-infos', params, (rs: any) => {
      resolve(rs);
    });
  });

// publish
export const publish = (params: VariablePublishParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxpageApi.put('/variables/version-publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// commit to store
export const commitToStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxpageApi.post('/stores/goods', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// offline
export const revokeFromStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxpageApi.put('/stores/goods-offline', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
