import { createAction } from 'typesafe-actions';

import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  ContentEntity,
  File,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectContentOfflineParams,
  ProjectContentSaveAsBaseParams,
  ProjectEntity,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PROJECTS_CONTENT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('WORKSPACE_PROJECT_UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateSaveLoading = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// project content list related
export const fetchContentList = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

export const pushContentList = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_CONTENT_LIST_SUCCESS',
  (data: ContentEntity[]) => ({ data }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'APPLICATION_PROJECTS_CONTENT__OPEN_EDIT_DRAWER',
  (open: boolean, editContent?: Partial<ContentEntity>) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_DRAWER_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'APPLICATION_PROJECTS_CONTENT__SAVE_CONTENT',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

// delete
export const deleteContent = createAction(
  'APPLICATION_PROJECTS_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

// offline
export const offlineContent = createAction(
  'APPLICATION_PROJECTS_CONTENT__OFF_CONTENT',
  (params: ProjectContentOfflineParams) => ({ ...params }),
)();

// copy
export const copyContent = createAction(
  'APPLICATION_PROJECTS_CONTENT__COPY_CONTENT',
  (params: ProjectContentCopyParams, cb?: () => void) => ({ params, cb }),
)();

// save as base
export const saveAsBaseContent = createAction(
  'APPLICATION_PROJECTS_CONTENT__SAVE_AS_BASE_CONTENT',
  (params: ProjectContentSaveAsBaseParams) => ({ ...params }),
)();

// locale related
export const fetchLocales = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_LOCALES',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushLocales = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_LOCALES_SUCCESS',
  (locales: string[]) => ({
    locales,
  }),
)();

// store related
export const commitFileToStore = createAction(
  'APPLICATION_PROJECTS_CONTENT__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams, cb?: () => void) => ({ params, cb }),
)();

export const offlineFileFromStore = createAction(
  'APPLICATION_PROJECTS_CONTENT__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams, cb?: () => void) => ({ params, cb }),
)();

export const fetchFileDetail = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_FILE_DETAIL',
  (params: FilesFetchParams) => ({ params }),
)();

export const pushFileDetail = createAction(
  'APPLICATION_PROJECTS_CONTENT__PUSH_FILE_DETAIL',
  (data: File) => ({
    data,
  }),
)();

export const updateFileOnlineStatus = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

// parent file related
export const fetchParentFiles = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'APPLICATION_PROJECTS_CONTENT__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();

// authorize
export const fetchAuthList = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'APPLICATION_PROJECTS_CONTENT__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_PROJECTS_CONTENT__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editContent?: ContentEntity) => ({
    visible,
    editContent,
  }),
)();

export const saveAuthUser = createAction(
  'APPLICATION_PROJECTS_CONTENT__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'APPLICATION_PROJECTS_CONTENT__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_PROJECTS_CONTENT__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('APPLICATION_PROJECTS_CONTENT__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
