import { createAction } from 'typesafe-actions';

import {
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  ContentEntity,
  PaginationInfo,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectContentOfflineParams,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_TEMPLATE_CONTENT__TEMPLATE_CLEAR_APP', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_TEMPLATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchTemplateContentList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__FETCH_TEMPLATE_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({
    ...params,
  }),
)();

export const pushTemplateContentList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__PUSH_TEMPLATE_CONTENT_LIST',
  (list: ContentEntity[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

// add/edit related
export const openEditDrawer = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__OPEN_EDIT_DRAWER',
  (open: boolean, editContent?: Partial<ContentEntity>) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_EDIT_CONTENT_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__SAVE_CONTENT',
  (params: ProjectContentFetchParams) => ({
    ...params,
  }),
)();

// offline
export const offlineContent = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__OFFLINE_CONTENT',
  (params: ProjectContentOfflineParams) => ({ ...params }),
)();

// copy
export const copyContent = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__COPY_CONTENT',
  (params: ProjectContentCopyParams, cb?: () => void) => ({ params, cb }),
)();

// delete related
export const deleteContent = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

// authorize related
export const fetchAuthList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__PUSH_AUTH_LIST',
  (list: AuthorizeListItem[]) => ({ list }),
)();

export const updateAuthListLoading = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editContent?: ContentEntity) => ({
    visible,
    editContent,
  }),
)();

export const saveAuthUser = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__SAVE_AUTH_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteAuthUser = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__DELETE_AUTH_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: (userList) => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__PUSH_USER_LIST',
  (list: User[]) => ({
    list,
  }),
)();
