import { createAction } from 'typesafe-actions';

import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
} from '@/types/auth';
import { PaginationInfo } from '@/types/common';
import {
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  ProjectFileSearchParams,
  ProjectFileType,
} from '@/types/project';
import { User } from '@/types/user';

export const fetchFileList = createAction(
  'WORKSPACE_PROJECT_DETAIL__FETCH_FILE_LIST',
  (params: ProjectFileSearchParams) => ({ ...params }),
)();

export const pushFileList = createAction(
  'WORKSPACE_PROJECT_DETAIL__FETCH_FILE_LIST_SUCCESS',
  (fileList: ProjectFileType[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

export const setLoading = createAction('WORKSPACE_PROJECT_DETAIL__SET_FILE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setSaveLoading = createAction(
  'WORKSPACE_PROJECT_DETAIL__SET_FILE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const setAddFileDrawerOpenStatus = createAction(
  'WORKSPACE_PROJECT_DETAIL__SET_ADD_FILE_DRAWER_OPEN',
  (drawerOpen = false, editFile?: ProjectFileType) => ({ drawerOpen, editFile }),
)();

export const updateEditFileValue = createAction(
  'WORKSPACE_PROJECT_DETAIL__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction(
  'WORKSPACE_PROJECT_DETAIL__SAVE_FILE',
  (params: ProjectFileSaveParams) => ({
    ...params,
  }),
)();

export const deleteFile = createAction(
  'WORKSPACE_PROJECT_DETAIL__DELETE_FILE',
  (params: ProjectFileDeleteParams) => ({ ...params }),
)();

export const clearAll = createAction('WORKSPACE_PROJECT_DETAIL__CLEAR_ALL', () => ({}))();

// authorize
export const fetchAuthList = createAction(
  'WORKSPACE_PROJECT_DETAIL__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_PROJECT_DETAIL__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_PROJECT_DETAIL__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_PROJECT_DETAIL__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editFile?: ProjectFileType) => ({
    visible,
    editFile,
  }),
)();

export const authAddUser = createAction(
  'WORKSPACE_PROJECT_DETAIL__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const authDeleteUser = createAction(
  'WORKSPACE_PROJECT_DETAIL__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_PROJECT_DETAIL__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('WORKSPACE_PROJECT_DETAIL__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
