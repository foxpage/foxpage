import { createAction } from 'typesafe-actions';

import { PaginationInfo } from '@/types/common';
import {
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  ProjectFileSearchParams,
  ProjectFileType,
} from '@/types/project';

export const fetchFileList = createAction(
  'PROJECTS_DETAIL__FETCH_FILE_LIST',
  (params: ProjectFileSearchParams) => ({ ...params }),
)();

export const pushFileList = createAction(
  'PROJECTS_DETAIL__FETCH_FILE_LIST_SUCCESS',
  (fileList: ProjectFileType[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

export const setLoading = createAction('PROJECTS_DETAIL__SET_FILE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setSaveLoading = createAction('PROJECTS_DETAIL__SET_FILE_SAVE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setAddFileDrawerOpenStatus = createAction(
  'PROJECTS_DETAIL__SET_ADD_FILE_DRAWER_OPEN',
  (drawerOpen = false, editFile?: ProjectFileType) => ({ drawerOpen, editFile }),
)();

export const updateEditFileValue = createAction(
  'PROJECTS_DETAIL__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction('PROJECTS_DETAIL__SAVE_FILE', (params: ProjectFileSaveParams) => ({
  ...params,
}))();

export const deleteFile = createAction('PROJECTS_DETAIL__DELETE_FILE', (params: ProjectFileDeleteParams) => ({
  ...params,
}))();

export const clearAll = createAction('PROJECTS_DETAIL__CLEAR_ALL', () => ({}))();
