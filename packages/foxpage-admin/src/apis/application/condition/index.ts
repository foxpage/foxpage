import {
  ConditionDeleteParams,
  ConditionDeleteRes,
  ConditionDetailFetchParams,
  ConditionFetchParams,
  ConditionFetchRes,
  ConditionPublishParams,
  ConditionSaveParams,
  ConditionSaveResponse,
  ConditionUpdateParams,
  ConditionUpdateRes,
  ResponseBody,
} from '@/types/index';
import FoxPageApi from '@/utils/api-agent';

export const fetchConditions = (params: ConditionFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/condition-searchs', params, (rs: ConditionFetchRes) => {
      resolve(rs);
    });
  });

export const fetchAppConditions = (params: ConditionFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/conditions/file-searchs', params, (rs: ConditionFetchRes) => {
      resolve(rs);
    });
  });

export const addCondition = (params: ConditionSaveParams) =>
  new Promise((resolve) => {
    FoxPageApi.post('/conditions', params, (rs: ConditionSaveResponse) => {
      resolve(rs);
    });
  });

export const updateCondition = (params: ConditionUpdateParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/conditions', params, (rs: ConditionUpdateRes) => {
      resolve(rs);
    });
  });

export const publishCondition = (params: ConditionPublishParams): Promise<ResponseBody> =>
  new Promise((resolve) => {
    FoxPageApi.put('/conditions/version-publish', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });

export const deleteCondition = (params: ConditionDeleteParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/conditions/status', params, (rs: ConditionDeleteRes) => {
      resolve(rs);
    });
  });

export const updateConditionVersion = (params: ConditionUpdateParams) =>
  new Promise((resolve) => {
    FoxPageApi.put('/conditions/versions', params, (rs: ConditionUpdateRes) => {
      resolve(rs);
    });
  });

export const fetchConditionDetail = (params: ConditionDetailFetchParams) =>
  new Promise((resolve) => {
    FoxPageApi.get('/conditions/build-versions?', params, (rs: ResponseBody) => {
      resolve(rs);
    });
  });
