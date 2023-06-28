import { createAction } from 'typesafe-actions';

import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeQueryParams,
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

export const clearAll = createAction('PROJECTS_FILE__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('PROJECTS_FILE__SET_FILE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaveLoading = createAction('PROJECTS_FILE__SET_FILE_SAVE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchFileList = createAction(
  'PROJECTS_FILE__FETCH_FILE_LIST',
  (params: ProjectFileFetchParams) => ({ params }),
)();

export const pushFileList = createAction(
  'PROJECTS_FILE__FETCH_FILE_LIST_SUCCESS',
  (fileList: File[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

export const openEditDrawer = createAction(
  'PROJECTS_FILE__OPEN_EDIT_DRAWER',
  (open = false, editFile?: File) => ({ open, editFile }),
)();

export const updateEditFileValue = createAction(
  'PROJECTS_FILE__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction(
  'PROJECTS_FILE__SAVE_FILE',
  (params: ProjectFileSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteFile = createAction(
  'PROJECTS_DETAILS__DELETE_FILE',
  (params: ProjectFileDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// parent file relation
export const fetchParentFiles = createAction(
  'PROJECTS_DETAILS__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'PROJECTS_DETAILS__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();

// authorize related
export const fetchAuthList = createAction(
  'PROJECTS_DETAILS__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction('PROJECTS_DETAILS__PUSH_AUTH_LIST', (list: AuthorizeListItem[]) => ({
  list,
}))();

export const updateAuthListLoading = createAction(
  'PROJECTS_DETAILS__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const checkAuthRole = createAction(
  'PROJECTS_DETAILS__CHECK_AUTH_ROLE',
  (params: AuthorizeQueryParams, cb?: (role: number) => void) => ({
    params,
    cb,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'PROJECTS_DETAILS__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editFile?: File) => ({
    visible,
    editFile,
  }),
)();

export const saveAuthUser = createAction(
  'PROJECTS_DETAILS__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'PROJECTS_DETAILS__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'PROJECTS_DETAILS__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('PROJECTS_DETAILS__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
