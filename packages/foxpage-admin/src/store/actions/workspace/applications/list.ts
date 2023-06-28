import { createAction } from 'typesafe-actions';

import {
  Application,
  ApplicationListFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  PaginationInfo,
  User,
} from '@/types/index';

export const clearAll = createAction('WORKSPACE_APPLICATIONS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('WORKSPACE_APPLICATIONS__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateSaveLoading = createAction(
  'WORKSPACE_APPLICATIONS__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchList = createAction(
  'WORKSPACE_APPLICATIONS__FETCH_LIST',
  (params: ApplicationListFetchParams) => ({
    params,
  }),
)();

export const pushList = createAction(
  'WORKSPACE_APPLICATIONS__PUSH_LIST',
  (applicationList: Application[], pageInfo: PaginationInfo) => ({
    applicationList,
    pageInfo,
  }),
)();

// save related
export const openEditDrawer = createAction(
  'WORKSPACE_APPLICATIONS__OPEN_EDIT_DRAWER',
  (visible: boolean, app?: Application) => ({
    visible,
    app,
  }),
)();

export const updateApp = createAction(
  'WORKSPACE_APPLICATIONS__UPDATE_APP',
  (key: string, value: unknown) => ({
    key,
    value,
  }),
)();

export const updateValue = createAction(
  'WORKSPACE_APPLICATIONS__UPDATE_VALUE',
  (key: string, value: unknown) => ({
    key,
    value,
  }),
)();

export const saveApp = createAction('WORKSPACE_APPLICATIONS__SAVE_APP', () => ({}))();

export const deleteApp = createAction('WORKSPACE_APPLICATIONS__DELETE_APP', (applicationId: string) => ({
  applicationId,
}))();

// authorize related
export const fetchAuthList = createAction(
  'WORKSPACE_APPLICATIONS__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_APPLICATIONS__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_APPLICATIONS__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_APPLICATIONS__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editApp?: Application) => ({
    visible,
    editApp,
  }),
)();

export const saveAuthUser = createAction(
  'WORKSPACE_APPLICATIONS__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'WORKSPACE_APPLICATIONS__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_APPLICATIONS___FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('WORKSPACE_APPLICATIONS___PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
