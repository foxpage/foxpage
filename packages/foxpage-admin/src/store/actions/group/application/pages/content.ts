import { createAction } from 'typesafe-actions';

import {
  ContentDeleteParams,
  ContentSearchParams,
  ContentType,
  ContentUpdateParams,
} from '@/types/application/content';
import { PaginationInfo } from '@/types/index';

export const fetchPageContentList = createAction(
  'ORGANIZATION_PROJECT_CONTENT__FETCH_PAGE_CONTENT_LIST',
  (params: ContentSearchParams) => ({
    ...params,
  }),
)();

export const pushPageContentList = createAction(
  'ORGANIZATION_PROJECT_CONTENT__PUSH_PAGE_CONTENT_LIST',
  (list: ContentType[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const deletePageContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__DELETE_PAGE_CONTENT',
  (params: ContentDeleteParams) => ({
    ...params,
  }),
)();

export const updatePageContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_PAGE_CONTENT',
  (params: ContentUpdateParams) => ({
    ...params,
  }),
)();

export const updateLoading = createAction('ORGANIZATION_PROJECT_CONTENT__UPDATE_PAGE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const clearAll = createAction('ORGANIZATION_PROJECT_CONTENT__PAGE_CLEAR_APP', () => ({}))();
