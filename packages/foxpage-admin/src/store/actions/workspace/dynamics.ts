import { createAction } from 'typesafe-actions';

import { PaginationInfo, PaginationReqParams } from '@/types/common';
import { Dynamic } from '@/types/workspace';

export const searchDynamics = createAction('WORKSPACE_GET_DYNAMICS', (params: PaginationReqParams) => ({
  ...params,
}))();

export const pushDynamics = createAction(
  'WORKSPACE_PUSH_DYNAMICS',
  (dynamics: Dynamic[], pageInfo: PaginationInfo) => ({
    dynamics,
    pageInfo,
  }),
)();

export const updateLoading = createAction('WORKSPACE_UPDATE_DYNAMICS_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('WORKSPACE_DYNAMICS_CLEAR_ALL', () => ({}))();
