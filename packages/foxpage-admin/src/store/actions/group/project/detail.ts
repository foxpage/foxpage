import { createAction } from 'typesafe-actions';

import { PaginationInfo } from '@/types/common';
import {
  ProjectFileDeleteParams,
  ProjectFileSaveParams,
  ProjectFileSearchParams,
  ProjectFileType,
} from '@/types/project';

export const fetchFileList = createAction(
  'ORGANIZATION_PROJECT_DETAIL__FETCH_FILE_LIST',
  (params: ProjectFileSearchParams) => ({ ...params }),
)();

export const pushFileList = createAction(
  'ORGANIZATION_PROJECT_DETAIL__FETCH_FILE_LIST_SUCCESS',
  (fileList: ProjectFileType[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

export const setLoading = createAction('ORGANIZATION_PROJECT_DETAIL__SET_FILE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const setSaveLoading = createAction(
  'ORGANIZATION_PROJECT_DETAIL__SET_FILE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const setAddFileDrawerOpenStatus = createAction(
  'ORGANIZATION_PROJECT_DETAIL__SET_ADD_FILE_DRAWER_OPEN',
  (drawerOpen = false, editFile?: ProjectFileType) => ({ drawerOpen, editFile }),
)();

export const updateEditFileValue = createAction(
  'ORGANIZATION_PROJECT_DETAIL__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction('ORGANIZATION_PROJECT_DETAIL__SAVE_FILE', (params: ProjectFileSaveParams) => ({
  ...params,
}))();

export const deleteFile = createAction(
  'ORGANIZATION_PROJECT_DETAIL__DELETE_FILE',
  (params: ProjectFileDeleteParams) => ({ ...params }),
)();

export const clearAll = createAction('ORGANIZATION_PROJECT_DETAIL__CLEAR_ALL', () => ({}))();
