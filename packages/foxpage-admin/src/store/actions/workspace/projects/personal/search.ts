import { createAction } from 'typesafe-actions';

import {
  Application,
  CommonSearchParams,
  PaginationInfo,
  PaginationReqParams,
  ProjectSearchEntity,
} from '@/types/index';

export const clearAll = createAction('WORKSPACE_PROJECTS_PERSONAL_SEARCH__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_SEARCH__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_SEARCH__FETCH_LIST',
  (params: CommonSearchParams) => ({
    ...params,
  }),
)();

export const pushList = createAction(
  'WORKSPACE_PROJECTS_PERSONAL_SEARCH__PUSH_LIST',
  (result: ProjectSearchEntity[], pageInfo: PaginationInfo) => ({ result, pageInfo }),
)();

export const fetchAPPList = createAction(
  'PROJECTS_SEARCH__FETCH_APP_LIST',
  (params: PaginationReqParams) => ({
    params,
  }),
)();

export const pushAPPList = createAction('PROJECTS_SEARCH__PUSH_APP_LIST', (data: Application[]) => ({
  data,
}))();
