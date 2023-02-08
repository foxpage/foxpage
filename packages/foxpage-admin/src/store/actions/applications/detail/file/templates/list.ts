import { createAction } from 'typesafe-actions';

import {
  ApplicationFileListFetchParams,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeQueryParams,
  AuthorizeUserFetchParams,
  File,
  PaginationInfo,
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_TEMPLATES_LIST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchApplicationTemplates = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__FETCH_LIST',
  (params: ApplicationFileListFetchParams) => ({
    ...params,
  }),
)();

export const pushApplicationTemplates = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__PUSH_LIST',
  (list: File[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__OPEN_EDIT_DRAWER',
  (drawerOpen = false, editFile?: File) => ({ drawerOpen, editFile }),
)();

export const updateEditFileValue = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_EDIT_FILE_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__SAVE_FILE',
  (params: ProjectFileSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// delete related
export const deleteFile = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__DELETE_FILE',
  (params: ProjectFileDeleteParams, cb?: () => void) => ({ params, cb }),
)();

// authorize related
export const fetchAuthList = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const checkAuthRole = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__CHECK_AUTH_ROLE',
  (params: AuthorizeQueryParams, cb?: (role: number) => void) => ({
    params,
    cb,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editFile?: File) => ({
    visible,
    editFile,
  }),
)();

export const saveAuthUser = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__PUSH_USER_LIST',
  (list: User[]) => ({
    list,
  }),
)();
