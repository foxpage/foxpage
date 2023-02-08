import { createAction } from 'typesafe-actions';

import { CommonSearchParams, PaginationInfo, ProjectSearchEntity } from '@/types/index';

export const clearAll = createAction('APPLICATION_PROJECTS_SEARCH__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_PROJECTS_SEARCH__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchList = createAction(
  'APPLICATION_PROJECTS_SEARCH__FETCH_LIST',
  (params: CommonSearchParams) => ({
    ...params,
  }),
)();

export const pushList = createAction(
  'APPLICATION_PROJECTS_SEARCH__PUSH_LIST',
  (result: ProjectSearchEntity[], pageInfo: PaginationInfo) => ({ result, pageInfo }),
)();
