import { createAction } from 'typesafe-actions';

import { Application } from '@/types/application';
import { PaginationInfo, PaginationReqParams } from '@/types/common';
import { ProjectSaveParams, ProjectType } from '@/types/project';

export const fetchProjectList = createAction(
  'ORGANIZATION_PROJECT__FETCH_PROJECT_LIST',
  (params: PaginationReqParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'ORGANIZATION_PROJECT__FETCH_PROJECT_LIST_SUCCESS',
  (projectList: ProjectType[], pageInfo: PaginationInfo) => ({ projectList, pageInfo }),
)();

export const setLoading = createAction('ORGANIZATION_PROJECT_SET__PROJECT_LIST_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setSaveLoading = createAction('ORGANIZATION_PROJECT_SET__PROJECT_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setAddDrawerOpenStatus = createAction(
  'ORGANIZATION_PROJECT__SET_ADD_PROJECT_DRAWER_OPEN',
  (drawerOpen = false, editProject?: ProjectType) => ({ drawerOpen, editProject }),
)();

export const updateEditProjectValue = createAction(
  'ORGANIZATION_PROJECT__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveProject = createAction('ORGANIZATION_PROJECT__SAVE_PROJECT', (params: ProjectSaveParams) => ({
  ...params,
}))();

export const deleteProject = createAction(
  'ORGANIZATION_PROJECT__DELETE_PROJECT',
  (id: string, applicationId: string) => ({ id, applicationId }),
)();

export const clearAll = createAction('ORGANIZATION_PROJECT__CLEAR_ALL', () => ({}))();

export const fetchApps = createAction(
  'ORGANIZATION_PROJECT_APPLICATION_LIST__FETCH_LIST',
  (params: PaginationReqParams) => ({ params }),
)();

export const pushApps = createAction(
  'ORGANIZATION_PROJECT_APPLICATION_LIST__FETCH_LIST_SUCCEED',
  (data: Application[]) => ({ data }),
)();
