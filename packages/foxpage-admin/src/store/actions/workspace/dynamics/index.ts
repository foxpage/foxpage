import { createAction } from 'typesafe-actions';

import { DynamicEntity, DynamicFetchParams, PaginationInfo } from '@/types/index';

export const clearAll = createAction('WORKSPACE_DYNAMICS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('WORKSPACE_DYNAMICS__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchDynamics = createAction(
  'WORKSPACE_DYNAMICS__FETCH_DYNAMICS',
  (params: DynamicFetchParams) => ({
    params,
  }),
)();

export const pushDynamics = createAction(
  'WORKSPACE_DYNAMICS__PUSH_DYNAMICS',
  (dynamics: DynamicEntity[], pageInfo: PaginationInfo) => ({
    dynamics,
    pageInfo,
  }),
)();
