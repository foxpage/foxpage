import { createAction } from 'typesafe-actions';

import { ContentEntity, PaginationInfo, ProjectContentFetchParams } from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_PAGES_CONTENT__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_PAGES_CONTENT__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchPageContentList = createAction(
  'APPLICATION_FILE_PAGES_CONTENT__FETCH_PAGE_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({
    ...params,
  }),
)();

export const pushPageContentList = createAction(
  'APPLICATION_FILE_PAGES_CONTENT__PUSH_PAGE_CONTENT_LIST',
  (list: ContentEntity[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();
