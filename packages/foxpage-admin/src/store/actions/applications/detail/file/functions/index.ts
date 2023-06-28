import { createAction } from 'typesafe-actions';

import {
  FileScope,
  FuncDeleteParams,
  FuncEntity,
  FuncFetchParams,
  FuncPublishParams,
  FuncSaveParams,
  PaginationInfo,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_FUNCTIONS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_FUNCTIONS__UPDATE_FETCH_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePaginationInfo = createAction(
  'APPLICATION_FILE_FUNCTIONS__UPDATE_PAGINATION_INFO',
  (pageInfo: PaginationInfo) => ({
    pageInfo,
  }),
)();

export const openEditDrawer = createAction(
  'APPLICATION_FILE_FUNCTIONS__UPDATE_FUNCTION_DRAWER_VISIBLE',
  (open: boolean, editFunc?: FuncEntity, type?: string) => ({
    open,
    editFunc,
    type,
  }),
)();

export const updateScope = createAction('APPLICATION_FILE_FUNCTIONS__UPDATE_SCOPE', (scope: FileScope) => ({
  scope,
}))();

export const fetchList = createAction(
  'APPLICATION_FILE_FUNCTIONS__FETCH_LIST',
  (params: FuncFetchParams) => ({
    params,
  }),
)();

export const pushList = createAction(
  'APPLICATION_FILE_FUNCTIONS__PUSH_LIST',
  (list: FuncEntity[], pageInfo: PaginationInfo, cb?: () => void) => ({
    list,
    pageInfo,
    cb,
  }),
)();

export const saveFunction = createAction(
  'APPLICATION_FILE_FUNCTIONS__SAVE_FUNCTION',
  (params: FuncSaveParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const publishFunction = createAction(
  'APPLICATION_FILE_FUNCTIONS__PUBLISH_FUNCTION',
  (params: FuncPublishParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteFunction = createAction(
  'APPLICATION_FILE_FUNCTIONS__DELETE_FUNCTION',
  (params: FuncDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();
