import { createAction } from 'typesafe-actions';

import {
  FuncDeleteParams,
  FuncFetchParams,
  FuncFetchRes,
  FuncItem,
  FuncNewParams,
  FuncUpdateParams,
} from '@/types/application/function';

// common
export const clearAll = createAction('BUILDER_FUNCTION__CLEAR_ALL', () => ({}))();

export const changeOffset = createAction('BUILDER_FUNCTION__CHANGE_PAGE_NO', (num: number) => ({
  num,
}))();

// fetch
export const updateLoading = createAction('BUILDER_FUNCTION__UPDATE_FETCH_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchList = createAction('BUILDER_FUNCTION__FETCH_LIST', (params: FuncFetchParams) => ({
  params,
}))();

export const fetchApplicationFunctions = createAction(
  'BUILDER_FUNCTION__FETCH_APPLICATION_FUNCTIONS',
  (params: FuncFetchParams) => ({
    ...params,
  }),
)();

export const pushList = createAction('BUILDER_FUNCTION__PUSH_LIST', (result: FuncFetchRes, cb?: () => void) => ({
  result,
  cb,
}))();

// new
export const saveFunction = createAction(
  'BUILDER_FUNCTION__SAVE_FUNCTION',
  (params: FuncNewParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

// delete
export const deleteFunction = createAction(
  'BUILDER_FUNCTION__DELETE_FUNCTION',
  (params: FuncDeleteParams, cb?: () => void, refreshData = true) => ({
    params,
    cb,
    refreshData,
  }),
)();

// update
export const updateFunction = createAction(
  'BUILDER_FUNCTION__UPDATE_FUNCTION',
  (params: FuncUpdateParams, cb?: () => void, refreshData = true) => ({
    params,
    cb,
    refreshData,
  }),
)();

export const updateFunctionDrawerVisible = createAction(
  'BUILDER_FUNCTION__UPDATE_FUNCTION_DRAWER_VISIBLE',
  (status: boolean, func?: FuncItem, type?: string) => ({
    status,
    func,
    type,
  }),
)();
