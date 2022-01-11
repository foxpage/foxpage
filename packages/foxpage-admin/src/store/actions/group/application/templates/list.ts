import { createAction } from 'typesafe-actions';

import { FileDeleteParams, FileSearchParams, FileType, FileUpdateParams } from '@/types/application/file';
import { PaginationInfo } from '@/types/index';

// state
export const fetchApplicationTemplates = createAction('ORG_APP_TEMPLATE__FETCH_LIST', (params: FileSearchParams) => ({
  ...params,
}))();

export const pushApplicationTemplates = createAction(
  'ORG_APP_TEMPLATE__PUSH_LIST',
  (list: FileType[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const updateLoading = createAction('ORG_APP_TEMPLATE__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateTemplate = createAction('ORG_APP_TEMPLATE__UPDATE_TEMPLATE', (params: FileUpdateParams) => ({
  ...params,
}))();

export const deleteTemplate = createAction('ORG_APP_TEMPLATE__DELETE_TEMPLATE', (params: FileDeleteParams) => ({
  ...params,
}))();

export const clearAll = createAction('ORG_APP_TEMPLATE__CLEAR_ALL', () => ({}))();
