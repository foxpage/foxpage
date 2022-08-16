import { createAction } from 'typesafe-actions';

import {
  File,
  PaginationInfo,
  ParentFileFetchParams,
  ProjectEntity,
  ProjectFileDeleteParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
} from '@/types/index';

export const clearAll = createAction('PROJECTS_FILE__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('PROJECTS_FILE__SET_FILE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaveLoading = createAction('PROJECTS_FILE__SET_FILE_SAVE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchFileList = createAction(
  'PROJECTS_FILE__FETCH_FILE_LIST',
  (params: ProjectFileFetchParams) => ({ params }),
)();

export const pushFileList = createAction(
  'PROJECTS_FILE__FETCH_FILE_LIST_SUCCESS',
  (fileList: File[], pageInfo: PaginationInfo) => ({ fileList, pageInfo }),
)();

export const openEditDrawer = createAction(
  'PROJECTS_FILE__OPEN_EDIT_DRAWER',
  (open = false, editFile?: File) => ({ open, editFile }),
)();

export const updateEditFileValue = createAction(
  'PROJECTS_FILE__UPDATE_DRAWER_VALUE',
  (name: string, value) => ({ name, value }),
)();

export const saveFile = createAction(
  'PROJECTS_FILE__SAVE_FILE',
  (params: ProjectFileSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteFile = createAction(
  'PROJECTS_DETAILS__DELETE_FILE',
  (params: ProjectFileDeleteParams) => ({
    ...params,
  }),
)();

// parent file relation
export const fetchParentFiles = createAction(
  'PROJECTS_DETAILS__FETCH_PARENT_FILES',
  (params: ParentFileFetchParams, cb?: (folder) => void) => ({
    params,
    cb,
  }),
)();

export const pushParentFiles = createAction(
  'PROJECTS_DETAILS__PUSH_PARENT_FILES',
  (folder: ProjectEntity) => ({
    folder,
  }),
)();
