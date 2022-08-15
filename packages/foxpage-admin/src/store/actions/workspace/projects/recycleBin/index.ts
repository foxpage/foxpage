import { createAction } from 'typesafe-actions';

import { CommonFetchParams, PaginationInfo, ProjectEntity } from '@/types/index';

export const clearAll = createAction('WORKSPACE_RECYCLE__CLEAR_ALL', () => ({}))();

export const fetchRecycle = createAction('WORKSPACE_RECYCLE__FETCH_RECYCLE', (params: CommonFetchParams) => ({
  params,
}))();

export const pushRecycle = createAction(
  'WORKSPACE_RECYCLE__PUSH_PROJECT',
  (projects: ProjectEntity[], pageInfo: PaginationInfo) => ({
    projects,
    pageInfo,
  }),
)();

export const updateLoading = createAction('WORKSPACE_RECYCLE__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();
