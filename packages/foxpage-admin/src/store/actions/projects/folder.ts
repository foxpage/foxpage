import { createAction } from 'typesafe-actions';

import {
  Application,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
} from '@/types/index';

export const clearAll = createAction('PROJECTS_LIST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('PROJECTS_LIST__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaveLoading = createAction('PROJECTS_LIST__UPDATE_SAVE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchProjectList = createAction(
  'PROJECTS_LIST__FETCH_PROJECT_LIST',
  (params: ProjectListFetchParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'PROJECTS_LIST__FETCH_PROJECT_LIST_SUCCESS',
  (projectList: ProjectEntity[], pageInfo: PaginationInfo) => ({ projectList, pageInfo }),
)();

export const saveProject = createAction(
  'PROJECTS_LIST__SAVE_PROJECT',
  (params: ProjectSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteProject = createAction(
  'PROJECTS_LIST__DELETE_PROJECT',
  (id: string, applicationId: string, cb?: () => void) => ({ id, applicationId, cb }),
)();

export const updateEditProjectValue = createAction(
  'PROJECTS_LIST__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const openEditDrawer = createAction(
  'PROJECTS_LIST__OPEN_EDIT_DRAWER',
  (open = false, editProject?: ProjectEntity) => ({ open, editProject }),
)();

export const fetchApps = createAction('PROJECTS_LIST__FETCH_LIST', (params: PaginationReqParams) => ({
  params,
}))();

export const pushApps = createAction('PROJECTS_LIST__FETCH_LIST_SUCCEED', (data: Application[]) => ({
  data,
}))();
