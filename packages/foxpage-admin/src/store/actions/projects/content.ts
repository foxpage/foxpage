import { createAction } from 'typesafe-actions';

import { FileDetailFetchParams, FileType } from '@/types/application/file';
import { ProjectContentType } from '@/types/application/project';
import {
  GoodsCommitParams,
  GoodsOfflineParams,
  ProjectContentDeleteParams,
  ProjectContentSearchParams,
} from '@/types/index';

export const fetchContentList = createAction(
  'PROJECTS_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const updateFetchLoading = createAction(
  'PROJECTS_CONTENT__UPDATE_FETCH_LOADING',
  (value: boolean) => ({
    value,
  }),
)();

export const pushContentList = createAction(
  'PROJECTS_CONTENT__FETCH_CONTENT_LIST_SUCCESS',
  (data: ProjectContentType[]) => ({ data }),
)();

export const updateEditDrawerOpen = createAction(
  'PROJECTS_CONTENT__UPDATE_EDIT_DRAWER_OPEN_STATUS',
  (open: boolean, editContent?: Partial<ProjectContentType>) => ({ open, editContent }),
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
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const deleteContent = createAction(
  'PROJECTS_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

export const fetchLocales = createAction('PROJECTS_CONTENT__FETCH_LOCALES', (applicationId: string) => ({
  applicationId,
}))();

export const pushLocales = createAction('PROJECTS_CONTENT__FETCH_LOCALES_SUCCESS', (locales: string[]) => ({
  locales,
}))();

export const commitFileToStore = createAction(
  'PROJECTS_CONTENT__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams) => ({ ...params }),
)();

export const offlineFileFromStore = createAction(
  'PROJECTS_CONTENT__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams) => ({ ...params }),
)();

export const fetchFileDetail = createAction(
  'PROJECTS_CONTENT__FETCH_FILE_DETAIL',
  (params: FileDetailFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction('PROJECTS_CONTENT__PUSH_FILE_DETAIL', (data: FileType) => ({
  data,
}))();

export const updateFileOnlineStatus = createAction(
  'PROJECTS_CONTENT__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

export const setSaveLoading = createAction('PROJECTS_CONTENT__SET_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('PROJECTS_CONTENT__CLEAR_ALL', () => ({}))();
