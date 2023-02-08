import { createAction } from 'typesafe-actions';

import { ContentVersionDataFetchedRes, ContentVersionDataFetchParams } from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_PAGES_CONTENT_HISTORY__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_PAGES_CONTENT_HISTORY__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchVersions = createAction(
  'APPLICATION_FILE_PAGES_CONTENT_HISTORY__FETCH_VERSIONS',
  (params: ContentVersionDataFetchParams) => ({
    params,
  }),
)();

export const pushVersions = createAction(
  'APPLICATION_FILE_PAGES_CONTENT_HISTORY__PUSH_VERSIONS',
  (data: ContentVersionDataFetchedRes) => ({
    data,
  }),
)();
