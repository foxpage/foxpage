import { createAction } from 'typesafe-actions';

import {
  Application,
  ApplicationFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  PaginationInfo,
  ProjectListFetchParams,
  ProjectSaveParams,
  ProjectType,
  User,
} from '@/types/index';

export const fetchProjectList = createAction(
  'WORKSPACE_PROJECT_LIST__FETCH_PROJECT_LIST',
  (params: ProjectListFetchParams) => ({ ...params }),
)();

export const pushProjectList = createAction(
  'WORKSPACE_PROJECT_LIST__FETCH_PROJECT_LIST_SUCCESS',
  (projectList: ProjectType[], pageInfo: PaginationInfo) => ({ projectList, pageInfo }),
)();

export const setLoading = createAction(
  'WORKSPACE_PROJECT_LIST__PROJECT_LIST_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const setSaveLoading = createAction(
  'WORKSPACE_PROJECT_LIST__PROJECT_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const setAddDrawerOpenStatus = createAction(
  'WORKSPACE_PROJECT_LIST__SET_ADD_PROJECT_DRAWER_OPEN',
  (drawerOpen = false, editProject?: ProjectType) => ({
    drawerOpen,
    editProject,
  }),
)();

export const updateEditProjectValue = createAction(
  'WORKSPACE_PROJECT_LIST__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveProject = createAction(
  'WORKSPACE_PROJECT_LIST__SAVE_PROJECT',
  (params: ProjectSaveParams) => ({
    ...params,
  }),
)();

export const deleteProject = createAction(
  'WORKSPACE_PROJECT_LIST__DELETE_PROJECT',
  (id: string, applicationId: string, organizationId: string, from?: string) => ({
    id,
    applicationId,
    organizationId,
    from,
  }),
)();

export const clearAll = createAction('WORKSPACE_PROJECT_LIST__CLEAR_ALL', () => ({}))();

export const fetchApps = createAction(
  'WORKSPACE_PROJECT_LIST__FETCH_LIST',
  (params: ApplicationFetchParams) => ({ params }),
)();

export const pushApps = createAction('WORKSPACE_PROJECT_LIST__FETCH_LIST_SUCCEED', (data: Application[]) => ({
  data,
}))();

// authorize
export const fetchAuthList = createAction(
  'WORKSPACE_PROJECT_LIST__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_PROJECT_LIST__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_PROJECT_LIST__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_PROJECT_LIST__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editProject?: ProjectType) => ({
    visible,
    editProject,
  }),
)();

export const authAddUser = createAction(
  'WORKSPACE_PROJECT_LIST__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const authDeleteUser = createAction(
  'WORKSPACE_PROJECT_LIST__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_PROJECT_LIST___FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('WORKSPACE_PROJECT_LIST___PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
