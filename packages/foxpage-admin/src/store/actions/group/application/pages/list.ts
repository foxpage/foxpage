import { createAction } from 'typesafe-actions';

import { FileDeleteParams, FileSearchParams, FileType, FileUpdateParams } from '@/types/application/file';
import { PaginationInfo } from '@/types/index';

export const updateLoading = createAction('ORG_APP_PAGE__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const fetchApplicationPages = createAction('ORG_APP_PAGE__FETCH_LIST', (params: FileSearchParams) => ({
  ...params,
}))();

export const updatePage = createAction('ORG_APP_PAGE__UPDATE_PAGE', (params: FileUpdateParams) => ({
  ...params,
}))();

export const deletePage = createAction('ORG_APP_PAGE__DELETE_PAGE', (params: FileDeleteParams) => ({
  ...params,
}))();

export const pushApplicationPages = createAction(
  'ORG_APP_PAGE__PUSH_LIST',
  (list: FileType[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const clearAll = createAction('ORG_APP_TEMPLATE__CLEAR_ALL', () => ({}))();
