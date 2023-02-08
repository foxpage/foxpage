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

export const clearAll = createAction('PROJECTS_CONTENT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('PROJECTS_CONTENT__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaveLoading = createAction('PROJECTS_CONTENT__UPDATE_SAVE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchContentList = createAction(
  'PROJECTS_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

export const pushContentList = createAction(
  'PROJECTS_CONTENT__FETCH_CONTENT_LIST_SUCCESS',
  (data: ContentEntity[]) => ({ data }),
)();

export const updateEditDrawerOpen = createAction(
  'PROJECTS_CONTENT__UPDATE_EDIT_DRAWER_OPEN_STATUS',
  (open: boolean, editContent?: Partial<ContentEntity>) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'PROJECTS_CONTENT__UPDATE_DRAWER_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'PROJECTS_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'PROJECTS_CONTENT__SAVE_CONTENT',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

export const deleteContent = createAction(
  'PROJECTS_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

// offline
export const offlineContent = createAction(
  'PROJECTS_CONTENT__OFF_CONTENT',
  (params: ProjectContentOfflineParams) => ({ ...params }),
)();

// copy
export const copyContent = createAction(
  'PROJECTS_CONTENT__COPY_CONTENT',
  (params: ProjectContentCopyParams, cb?: () => void) => ({ params, cb }),
)();

// save as base
export const saveAsBaseContent = createAction(
  'PROJECTS_CONTENT__SAVE_AS_BASE_CONTENT',
  (params: ProjectContentSaveAsBaseParams) => ({ ...params }),
)();

export const fetchLocales = createAction('PROJECTS_CONTENT__FETCH_LOCALES', (applicationId: string) => ({
  applicationId,
}))();

export const pushLocales = createAction('PROJECTS_CONTENT__FETCH_LOCALES_SUCCESS', (locales: string[]) => ({
  locales,
}))();

export const updateFileOnlineStatus = createAction(
  'PROJECTS_CONTENT__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

// store related
export const commitFileToStore = createAction(
  'PROJECTS_CONTENT__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams, cb?: () => void) => ({ params, cb }),
)();

export const offlineFileFromStore = createAction(
  'PROJECTS_CONTENT__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams, cb?: () => void) => ({ params, cb }),
)();

// file detail related
export const fetchFileDetail = createAction(
  'PROJECTS_CONTENT__FETCH_FILE_DETAIL',
  (params: FilesFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction('PROJECTS_CONTENT__PUSH_FILE_DETAIL', (data: File) => ({
  data,
}))();

// parent file related
export const fetchParentFiles = createAction(
  'PROJECTS_CONTENT__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'PROJECTS_CONTENT__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();

// authorize
export const fetchAuthList = createAction(
  'PROJECTS_CONTENT__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction('PROJECTS_CONTENT__PUSH_AUTH_LIST', (list: AuthorizeListItem[]) => ({
  list,
}))();

export const updateAuthListLoading = createAction(
  'PROJECTS_CONTENT__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'PROJECTS_CONTENT__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editContent?: ContentEntity) => ({
    visible,
    editContent,
  }),
)();

export const saveAuthUser = createAction(
  'PROJECTS_CONTENT__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'PROJECTS_CONTENT__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'PROJECTS_CONTENT__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('PROJECTS_CONTENT__PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
