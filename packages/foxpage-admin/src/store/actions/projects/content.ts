import { createAction } from 'typesafe-actions';

import {
  ContentEntity,
  File,
  FilesFetchParams,
  GoodsCommitParams,
  GoodsOfflineParams,
  ParentFileFetchParams,
  ProjectContentDeleteParams,
  ProjectContentFetchParams,
  ProjectEntity,
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
