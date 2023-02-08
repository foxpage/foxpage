import { createAction } from 'typesafe-actions';

import {
  AuthorizeAddParams,
  AuthorizeQueryParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  File,
  PaginationInfo,
  ParentFileFetchParams,
  ProjectEntity,
  ProjectFileDeleteParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PROJECTS_FILE__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_PROJECTS_FILE__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_PROJECTS_FILE__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// project file list related
export const fetchFileList = createAction(
  'APPLICATION_PROJECTS_FILE__FETCH_FILE_LIST',
  (params: ProjectFileFetchParams) => ({ params }),
)();

export const pushFileList = createAction(
  'APPLICATION_PROJECTS_FILE__PUSH_FILE_LIST',
  (fileList: File[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'APPLICATION_PROJECTS_FILE__OPEN_EDIT_DRAWER',
  (drawerOpen = false, editFile?: File) => ({ drawerOpen, editFile }),
)();

export const updateEditFileValue = createAction(
  'APPLICATION_PROJECTS_FILE__UPDATE_EDIT_FILE_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction(
  'APPLICATION_PROJECTS_FILE__SAVE_FILE',
  (params: ProjectFileSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// delete related
export const deleteFile = createAction(
  'APPLICATION_PROJECTS_FILE__DELETE_FILE',
  (params: ProjectFileDeleteParams, cb?: () => void) => ({ params, cb }),
)();

// parent file relation
export const fetchParentFiles = createAction(
  'APPLICATION_PROJECTS_FILE__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'APPLICATION_PROJECTS_FILE__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();

// authorize related
export const fetchAuthList = createAction(
  'APPLICATION_PROJECTS_FILE__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'APPLICATION_PROJECTS_FILE__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'APPLICATION_PROJECTS_FILE__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const checkAuthRole = createAction(
  'APPLICATION_PROJECTS_FILE__CHECK_AUTH_ROLE',
  (params: AuthorizeQueryParams, cb?: (role: number) => void) => ({
    params,
    cb,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_PROJECTS_FILE__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editFile?: File) => ({
    visible,
    editFile,
  }),
)();

export const saveAuthUser = createAction(
  'APPLICATION_PROJECTS_FILE__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'APPLICATION_PROJECTS_FILE__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_PROJECTS_FILE__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('APPLICATION_PROJECTS_FILE__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
