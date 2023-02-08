import { createAction } from 'typesafe-actions';

import {
  Application,
  AuthorizeAddParams,
  AuthorizeQueryParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PROJECTS_FOLDER__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_PROJECTS_FOLDER__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_PROJECTS_FOLDER__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// project list related
export const fetchProjectList = createAction(
  'APPLICATION_PROJECTS_FOLDER__FETCH_PROJECT_LIST',
  (params: ProjectListFetchParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'APPLICATION_PROJECTS_FOLDER__PUSH_PROJECT_LIST',
  (projectList: ProjectEntity[], pageInfo: PaginationInfo) => ({ projectList, pageInfo }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'APPLICATION_PROJECTS_FOLDER__OPEN_EDIT_DRAWER',
  (drawerOpen = false, editProject?: ProjectEntity) => ({
    drawerOpen,
    editProject,
  }),
)();

export const updateEditProjectValue = createAction(
  'APPLICATION_PROJECTS_FOLDER__UPDATE_EDIT_PROJECT_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveProject = createAction(
  'APPLICATION_PROJECTS_FOLDER__SAVE_PROJECT',
  (params: ProjectSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// delete related
export const deleteProject = createAction(
  'APPLICATION_PROJECTS_FOLDER__DELETE_PROJECT',
  (id: string, applicationId: string, cb?: () => void) => ({
    id,
    applicationId,
    cb,
  }),
)();

// application list related
export const fetchApps = createAction(
  'APPLICATION_PROJECTS_FOLDER__FETCH_LIST',
  (params: PaginationReqParams) => ({ params }),
)();

export const pushApps = createAction(
  'APPLICATION_PROJECTS_FOLDER__FETCH_LIST_SUCCEED',
  (data: Application[]) => ({
    data,
  }),
)();

// authorize related
export const fetchAuthList = createAction(
  'APPLICATION_PROJECTS_FOLDER__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'APPLICATION_PROJECTS_FOLDER__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'APPLICATION_PROJECTS_FOLDER__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_PROJECTS_FOLDER__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editProject?: ProjectEntity) => ({
    visible,
    editProject,
  }),
)();

export const saveAuthUser = createAction(
  'APPLICATION_PROJECTS_FOLDER__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'APPLICATION_PROJECTS_FOLDER__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_PROJECTS_FOLDER___FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('APPLICATION_PROJECTS_FOLDER___PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();

// auth check
export const queryMask = createAction(
  'APPLICATION_PROJECTS_FOLDER___QUERY_MASK',
  (params: AuthorizeQueryParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushMask = createAction('APPLICATION_PROJECTS_FOLDER___PUSH_MASK', (mask: number) => ({
  mask,
}))();
