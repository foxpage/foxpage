import { createAction } from 'typesafe-actions';

import { Application } from '@/types/application';
import { PaginationInfo, PaginationReqParams } from '@/types/common';
import { ProjectListFetchParams, ProjectSaveParams, ProjectType } from '@/types/project';

export const fetchProjectList = createAction(
  'PROJECTS_LIST__FETCH_PROJECT_LIST',
  (params: ProjectListFetchParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'PROJECTS_LIST__FETCH_PROJECT_LIST_SUCCESS',
  (projectList: ProjectType[], pageInfo: PaginationInfo) => ({ projectList, pageInfo }),
)();

export const setLoading = createAction('PROJECTS_LIST_SET__PROJECT_LIST_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setSaveLoading = createAction('PROJECTS_LIST_SET__PROJECT_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setAddDrawerOpenStatus = createAction(
  'PROJECTS_LIST__SET_ADD_PROJECT_DRAWER_OPEN',
  (drawerOpen = false, editProject?: ProjectType) => ({ drawerOpen, editProject }),
)();

export const updateEditProjectValue = createAction(
  'PROJECTS_LIST__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveProject = createAction('PROJECTS_LIST__SAVE_PROJECT', (params: ProjectSaveParams) => ({
  ...params,
}))();

export const deleteProject = createAction(
  'PROJECTS_LIST__DELETE_PROJECT',
  (id: string, applicationId: string, organizationId: string) => ({ id, applicationId, organizationId }),
)();

export const clearAll = createAction('PROJECTS_LIST__CLEAR_ALL', () => ({}))();

export const fetchApps = createAction(
  'PROJECTS_LIST_APPLICATION_LIST__FETCH_LIST',
  (params: PaginationReqParams) => ({ params }),
)();

export const pushApps = createAction(
  'PROJECTS_LIST_APPLICATION_LIST__FETCH_LIST_SUCCEED',
  (data: Application[]) => ({ data }),
)();
