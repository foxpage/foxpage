import { createAction } from 'typesafe-actions';

import {
  ConditionDeleteParams,
  ConditionFetchParams,
  ConditionFetchRes,
  ConditionItem,
  ConditionNewParams,
  ConditionUpdateParams,
} from '@/types/application/condition';
import VariableType from '@/types/application/variable';

// common
export const clearAll = createAction('BUILDER_CONDITION__CLEAR_ALL', () => ({}))();

export const changeOffset = createAction('BUILDER_CONDITION__CHANGE_PAGE_NO', (num: number) => ({
  num,
}))();

// fetch
export const updateLoading = createAction('BUILDER_CONDITION__UPDATE_FETCH_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchList = createAction('BUILDER_CONDITION__FETCH_LIST', (params: ConditionFetchParams) => ({
  params,
}))();

export const fetchApplicationConditions = createAction(
  'BUILDER_CONDITION__FETCH_APPLICATION_CONDITIONS',
  (params: ConditionFetchParams) => ({
    ...params,
  }),
)();

export const pushList = createAction('BUILDER_CONDITION__PUSH_LIST', (result: ConditionFetchRes, cb?: () => void) => ({
  result,
  cb,
}))();

// new
export const saveCondition = createAction(
  'BUILDER_CONDITION__SAVE_CONDITION',
  (params: ConditionNewParams, cb?: (condition?: string) => void, refreshList?: boolean) => ({
    params,
    cb,
    refreshList,
  }),
)();

// delete
export const deleteCondition = createAction(
  'BUILDER_CONDITION__DELETE_CONDITION',
  (params: ConditionDeleteParams, cb?: () => void, refreshList = true) => ({
    params,
    cb,
    refreshList,
  }),
)();

// update
export const updateCondition = createAction(
  'BUILDER_CONDITION__UPDATE_CONDITION',
  (params: ConditionUpdateParams, cb?: (condition?: string) => void, refreshList?: boolean) => ({
    params,
    cb,
    refreshList,
  }),
)();

export const updateConditionVersion = createAction(
  'BUILDER_CONDITION__UPDATE_CONDITION_VERSION',
  (params: ConditionNewParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const updateConditionDrawerVisible = createAction(
  'BUILDER_CONDITION__UPDATE_CONDITION_DRAWER_VISIBLE',
  (status: boolean, condition?: ConditionItem, type?: string) => ({
    status,
    condition,
    type,
  }),
)();

export const updateConditionBindDrawerVisible = createAction(
  'BUILDER_CONDITION__UPDATE_CONDITION_BIND_DRAWER_VISIBLE',
  (open: boolean) => ({
    open,
  }),
)();

export const searchLocalTimeVariable = createAction(
  'BUILDER_CONDITION__SEARCH_LOCAL_TIME_VARIABLE',
  (search: string[], cb: (data: VariableType[]) => void) => ({
    search,
    cb,
  }),
)();
