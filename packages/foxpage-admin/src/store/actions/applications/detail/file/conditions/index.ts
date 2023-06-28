import { createAction } from 'typesafe-actions';

import {
  ConditionDeleteParams,
  ConditionDetailFetchParams,
  ConditionEntity,
  ConditionFetchParams,
  ConditionPublishParams,
  ConditionSaveParams,
  FileScope,
  PaginationInfo,
} from '@/types/index';

// common
export const clearAll = createAction('APPLICATION_FILE_CONDITIONS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_CONDITIONS__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePaginationInfo = createAction(
  'APPLICATION_FILE_CONDITIONS__UPDATE_PAGINATION_INFO',
  (pageInfo: PaginationInfo) => ({
    pageInfo,
  }),
)();

export const openEditDrawer = createAction(
  'APPLICATION_FILE_CONDITIONS__UPDATE_CONDITION_DRAWER_VISIBLE',
  (open: boolean, editCondition?: ConditionEntity, type?: string) => ({
    open,
    editCondition,
    type,
  }),
)();

export const updateScope = createAction('APPLICATION_FILE_CONDITIONS__UPDATE_SCOPE', (scope: FileScope) => ({
  scope,
}))();

// fetch
export const fetchList = createAction(
  'APPLICATION_FILE_CONDITIONS__FETCH_LIST',
  (params: ConditionFetchParams) => ({
    params,
  }),
)();

export const pushList = createAction(
  'APPLICATION_FILE_CONDITIONS__PUSH_LIST',
  (list: ConditionEntity[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const saveCondition = createAction(
  'APPLICATION_FILE_CONDITIONS__SAVE_CONDITION',
  (params: ConditionSaveParams, cb?: (condition?: string) => void) => ({
    params,
    cb,
  }),
)();

export const publishCondition = createAction(
  'APPLICATION_FILE_CONDITIONS__PUBLISH_CONDITION',
  (params: ConditionPublishParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteCondition = createAction(
  'APPLICATION_FILE_CONDITIONS__DELETE_CONDITION',
  (params: ConditionDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const saveConditionVersion = createAction(
  'APPLICATION_FILE_CONDITIONS__SAVE_CONDITION_VERSION',
  (params: ConditionSaveParams, cb?: (id: string) => void) => ({
    params,
    cb,
  }),
)();

export const fetchConditionDetail = createAction(
  'APPLICATION_FILE_CONDITIONS__FETCH_CONDITION_DETAIL',
  (params: ConditionDetailFetchParams, cb?: (condition: ConditionEntity) => void) => ({
    params,
    cb,
  }),
)();

export const pushConditionDetail = createAction(
  'APPLICATION_FILE_CONDITIONS__PUSH_CONDITION_DETAIL',
  (condition: ConditionEntity) => ({
    condition,
  }),
)();
