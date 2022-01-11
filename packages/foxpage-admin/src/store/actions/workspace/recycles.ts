import { createAction } from 'typesafe-actions';

import { PaginationInfo, PaginationReqParams } from '@/types/common';
import { ProjectType } from '@/types/project';

export const searchRecycles = createAction('WORKSPACE_RECYCLE_GET_PROJECTS', (params: PaginationReqParams) => ({
  ...params,
}))();

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
