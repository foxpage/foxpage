import {
  AppVariablesFetchResponse,
  BaseResponse,
  GoodsCommitParams,
  ResponseBody,
  VariableEntity,
  VariablePublishParams,
  VariableSearchParams,
  VariablesFetchParams,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

// fetchApplicationVariables
export const fetchAppVariables = (params: VariablesFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/variables/file-searchs', params, (rs: AppVariablesFetchResponse) => {
      resolve(rs);
    });
  });

// getVariables
export const fetchVariables = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/variable-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });

export const getVariableBuildVersion = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/variables/build-versions', params, (rs: any) => {
      resolve(rs);
    });
  });

export const addVariables = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.post('/variables', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updateVariables = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/variables', params, (rs: any) => {
      resolve(rs);
    });
  });

export const updateVariableContent = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/variables/contents', params, (rs: any) => {
      resolve(rs);
    });
  });

export const deleteVariable = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/variables/status', params, (rs: any) => {
      resolve(rs);
    });
  });

export const searchVariable = (params: VariableSearchParams): Promise<BaseResponse<VariableEntity[]>> =>
  new Promise((resolve) => {
    FoxPageApi.post('/variables/scope-infos', params, (rs: any) => {
      resolve(rs);
    });
  });

// publish
export const publish = (params: VariablePublishParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/variables/version-publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

// store related
export const commitToStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.post('/stores/goods', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const revokeFromStore = (params: GoodsCommitParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/stores/goods-offline', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
