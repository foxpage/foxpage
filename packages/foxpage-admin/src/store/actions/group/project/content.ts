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
  'ORGANIZATION_PROJECT_CONTENT__FETCH_CONTENT_LIST',
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const updateFetchLoading = createAction('ORGANIZATION_PROJECT_UPDATE_FETCH_LOADING', (value: boolean) => ({
  value,
}))();

export const pushContentList = createAction(
  'ORGANIZATION_PROJECT_CONTENT__FETCH_CONTENT_LIST_SUCCESS',
  (data: ProjectContentType[]) => ({ data }),
)();

export const updateEditDrawerOpen = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_EDIT_DRAWER_OPEN_STATUS',
  (open: boolean, editContent?: ProjectContentType) => ({ open, editContent }),
)();

export const updateEditContentValue = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_DRAWER_VALUE',
  (key: string, value) => ({ key, value }),
)();

export const updateEditContentTags = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_UPDATE_DRAWER_TAGS',
  (key: string, value) => ({ key, value }),
)();

export const saveContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__SAVE_CONTENT',
  (params: ProjectContentSearchParams) => ({ ...params }),
)();

export const deleteContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__DELETE_CONTENT',
  (params: ProjectContentDeleteParams) => ({ ...params }),
)();

export const fetchLocales = createAction('ORGANIZATION_PROJECT_CONTENT__FETCH_LOCALES', (applicationId: string) => ({
  applicationId,
}))();

export const pushLocales = createAction('ORGANIZATION_PROJECT_CONTENT__FETCH_LOCALES_SUCCESS', (locales: string[]) => ({
  locales,
}))();

export const commitFileToStore = createAction(
  'ORGANIZATION_PROJECT_DETAIL__COMMIT_FILE_TO_STORE',
  (params: GoodsCommitParams) => ({ ...params }),
)();

export const offlineFileFromStore = createAction(
  'ORGANIZATION_PROJECT_DETAIL__REVOKE_FILE_FROM_STORE',
  (params: GoodsOfflineParams) => ({ ...params }),
)();

export const fetchFileDetail = createAction(
  'ORGANIZATION_PROJECT_DETAIL__FETCH_FILE_DETAIL',
  (params: FileDetailFetchParams) => ({ ...params }),
)();

export const pushFileDetail = createAction('ORGANIZATION_PROJECT_DETAIL__PUSH_FILE_DETAIL', (data: FileType) => ({
  data,
}))();

export const updateFileOnlineStatus = createAction(
  'ORGANIZATION_PROJECT_DETAIL__UPDATE_ONLINE_STATUS',
  (online: boolean) => ({ online }),
)();

export const setSaveLoading = createAction('ORGANIZATION_PROJECT_CONTENT__SET_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('ORGANIZATION_PROJECT_CONTENT__CLEAR_ALL', () => ({}))();
