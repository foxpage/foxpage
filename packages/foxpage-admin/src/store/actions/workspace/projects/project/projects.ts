import { createAction } from 'typesafe-actions';

import { PaginationInfo, PaginationReqParams } from '@/types/common';
import { ProjectType } from '@/types/project';

export const searchMyProjects = createAction('WORKSPACE_GET_PROJECTS', (params: PaginationReqParams) => ({
  ...params,
}))();

export const pushMyProjects = createAction(
  'WORKSPACE_PUSH_PROJECTS',
  (projects: ProjectType[], pageInfo: PaginationInfo) => ({
    projects,
    pageInfo,
  }),
)();

export const updateLoading = createAction('WORKSPACE_UPDATE_PROJECTS_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('WORKSPACE_PROJECT_CLEAR_ALL', () => ({}))();
