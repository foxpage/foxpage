import { createAction } from 'typesafe-actions';

import { FileDetailFetchParams, FileType } from '@/types/application/file';
import { ProjectContentType } from '@/types/application/project';
import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ProjectContentDeleteParams,
  ProjectContentSearchParams,
  User,
} from '@/types/index';

export const fetchContentList = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const updateFetchLoading = createAction(
  'WORKSPACE_PROJECT_UPDATE_FETCH_LOADING',
  (value: boolean) => ({
    value,
  }),
)();

export const pushContentList = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_CONTENT_LIST_SUCCESS',
  (data: ProjectContentType[]) => ({ data }),
)();

export const updateEditDrawerOpen = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_EDIT_DRAWER_OPEN_STATUS',
  (open: boolean, editContent?: Partial<ProjectContentType>) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_DRAWER_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'WORKSPACE_PROJECT_CONTENT__SAVE_CONTENT',
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const deleteContent = createAction(
  'WORKSPACE_PROJECT_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

export const fetchLocales = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_LOCALES',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushLocales = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_LOCALES_SUCCESS',
  (locales: string[]) => ({
    locales,
  }),
)();

export const commitFileToStore = createAction(
  'WORKSPACE_PROJECT_CONTENT__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams) => ({ ...params }),
)();

export const offlineFileFromStore = createAction(
  'WORKSPACE_PROJECT_CONTENT__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams) => ({ ...params }),
)();

export const fetchFileDetail = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_FILE_DETAIL',
  (params: FileDetailFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction(
  'WORKSPACE_PROJECT_CONTENT__PUSH_FILE_DETAIL',
  (data: FileType) => ({
    data,
  }),
)();

export const updateFileOnlineStatus = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

export const setSaveLoading = createAction(
  'WORKSPACE_PROJECT_CONTENT__SET_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const clearAll = createAction('WORKSPACE_PROJECT_CONTENT__CLEAR_ALL', () => ({}))();

// authorize
export const fetchAuthList = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_PROJECT_CONTENT__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_PROJECT_CONTENT__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editContent?: ProjectContentType) => ({
    visible,
    editContent,
  }),
)();

export const authAddUser = createAction(
  'WORKSPACE_PROJECT_CONTENT__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const authDeleteUser = createAction(
  'WORKSPACE_PROJECT_CONTENT__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_PROJECT_CONTENT__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('WORKSPACE_PROJECT_CONTENT__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
