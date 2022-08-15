import { createAction } from 'typesafe-actions';

import { ContentEntity, PaginationInfo, ProjectContentFetchParams } from '@/types/index';

export const clearAll = createAction('APPLICATION_FILE_TEMPLATE_CONTENT__TEMPLATE_CLEAR_APP', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__UPDATE_TEMPLATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchTemplateContentList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__FETCH_TEMPLATE_CONTENT_LIST',
  (params: ProjectContentFetchParams) => ({
    ...params,
  }),
)();

export const pushTemplateContentList = createAction(
  'APPLICATION_FILE_TEMPLATE_CONTENT__PUSH_TEMPLATE_CONTENT_LIST',
  (list: ContentEntity[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();
