import { createAction } from 'typesafe-actions';

import {
  Application,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
  ProjectSearchResult,
  User,
} from '@/types/index';

export const clearAll = createAction('WORKSPACE_PROJECTS_PERSONAL_FOLDER__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// project list related
export const fetchProjectList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__FETCH_PROJECT_LIST',
  (params: ProjectListFetchParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__PUSH_PROJECT_LIST',
  (result: ProjectSearchResult | ProjectEntity[], pageInfo: PaginationInfo) => ({ result, pageInfo }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__OPEN_EDIT_DRAWER',
  (drawerOpen = false, editProject?: ProjectEntity) => ({
    drawerOpen,
    editProject,
  }),
)();

export const updateEditProjectValue = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__UPDATE_EDIT_PROJECT_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveProject = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__SAVE_PROJECT',
  (params: ProjectSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// delete related
export const deleteProject = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__DELETE_PROJECT',
  (id: string, applicationId: string, cb?: () => void) => ({
    id,
    applicationId,
    cb,
  }),
)();

// application list related
export const fetchApps = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__FETCH_APP_LIST',
  (params: PaginationReqParams) => ({ params }),
)();

export const pushApps = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__PUSH_APP_LIST',
  (data: Application[]) => ({
    data,
  }),
)();

export const fetchAllApps = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__FETCH_ALL_APP_LIST',
  (params: PaginationReqParams) => ({ params }),
)();

export const pushAllApps = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__PUSH_ALL_APP_LIST',
  (data: Application[]) => ({
    data,
  }),
)();

// authorize related
export const fetchAuthList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editProject?: ProjectEntity) => ({
    visible,
    editProject,
  }),
)();

export const saveAuthUser = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER___FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_FOLDER___PUSH_USER_LIST',
  (list: User[]) => ({
    list,
  }),
)();
