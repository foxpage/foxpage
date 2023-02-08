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
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectEntity,
  User,
} from '@/types/index';

export const clearAll = createAction('WORKSPACE_PROJECTS_INVOLVED_CONTENT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// project content list related
export const fetchContentList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

export const pushContentList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__PUSH_CONTENT_LIST',
  (data: ContentEntity[]) => ({ data }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__OPEN_EDIT_DRAWER',
  (open: boolean, editContent?: Partial<ContentEntity>) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_DRAWER_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__SAVE_CONTENT',
  (params: ProjectContentFetchParams) => ({ ...params }),
)();

// delete related
export const deleteContent = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

// locale related
export const fetchLocales = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_LOCALES',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushLocales = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_LOCALES_SUCCESS',
  (locales: string[]) => ({
    locales,
  }),
)();

// store related
export const commitFileToStore = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams, cb?: () => void) => ({ params, cb }),
)();

export const offlineFileFromStore = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams, cb?: () => void) => ({ params, cb }),
)();

export const fetchFileDetail = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_FILE_DETAIL',
  (params: FilesFetchParams) => ({ params }),
)();

export const pushFileDetail = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__PUSH_FILE_DETAIL',
  (data: File) => ({
    data,
  }),
)();

export const updateFileOnlineStatus = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

// parent file related
export const fetchParentFiles = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();

// authorize
export const fetchAuthList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editContent?: ContentEntity) => ({
    visible,
    editContent,
  }),
)();

export const saveAuthUser = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction(
  'WORKSPACE_PROJECTS_INVOLVED_CONTENT__PUSH_USER_LIST',
  (list: User[]) => ({
    list,
  }),
)();
