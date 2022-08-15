import { createAction } from 'typesafe-actions';

import { ApplicationFileListFetchParams, File, PaginationInfo } from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_TEMPLATES_LIST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchApplicationTemplates = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__FETCH_LIST',
  (params: ApplicationFileListFetchParams) => ({
    ...params,
  }),
)();

export const pushApplicationTemplates = createAction(
  'APPLICATION_FILE_TEMPLATES_LIST__PUSH_LIST',
  (list: File[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();
