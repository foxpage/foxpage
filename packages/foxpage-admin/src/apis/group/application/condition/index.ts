import {
  ConditionDeleteParams,
  ConditionDeleteRes,
  ConditionFetchParams,
  ConditionFetchRes,
  ConditionNewParams,
  ConditionNewRes,
  ConditionUpdateParams,
  ConditionUpdateRes,
} from '@/types/application/condition';
import FoxpageApi from '@/utils/foxpage-api-sdk';

export const getConditions = (params: ConditionFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/condition-searchs', params, (rs: ConditionFetchRes) => {
      resolve(rs);
    });
  });

export const getApplicationConditions = (params: ConditionFetchParams) =>
  new Promise(resolve => {
    FoxpageApi.get('/conditions/file-searchs', params, (rs: ConditionFetchRes) => {
      resolve(rs);
    });
  });

export const addCondition = (params: ConditionNewParams) =>
  new Promise(resolve => {
    FoxpageApi.post('/conditions', params, (rs: ConditionNewRes) => {
      resolve(rs);
    });
  });

export const updateCondition = (params: ConditionUpdateParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/conditions', params, (rs: ConditionUpdateRes) => {
      resolve(rs);
    });
  });

export const deleteCondition = (params: ConditionDeleteParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/conditions/status', params, (rs: ConditionDeleteRes) => {
      resolve(rs);
    });
  });

export const updateConditionVersion = (params: ConditionUpdateParams) =>
  new Promise(resolve => {
    FoxpageApi.put('/conditions/versions', params, (rs: ConditionUpdateRes) => {
      resolve(rs);
    });
  });
