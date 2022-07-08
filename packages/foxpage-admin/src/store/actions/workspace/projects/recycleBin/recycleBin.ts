import { createAction } from 'typesafe-actions';

import { PaginationInfo } from '@/types/common';
import { ProjectCommonFetchParams, ProjectType } from '@/types/project';

export const searchRecycles = createAction(
  'WORKSPACE_RECYCLE_GET_PROJECTS',
  (params: ProjectCommonFetchParams) => ({
    params,
  }),
)();

export const pushRecycles = createAction(
  'WORKSPACE_RECYCLE_PUSH_PROJECTS',
  (projects: ProjectType[], pageInfo: PaginationInfo) => ({
    projects,
    pageInfo,
  }),
)();

export const updateLoading = createAction('WORKSPACE_RECYCLE_UPDATE_RECYCLE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('WORKSPACE_RECYCLE_CLEAR_ALL', () => ({}))();
