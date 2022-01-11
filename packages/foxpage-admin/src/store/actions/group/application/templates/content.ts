import { createAction } from 'typesafe-actions';

import {
  ContentDeleteParams,
  ContentSearchParams,
  ContentType,
  ContentUpdateParams,
} from '@/types/application/content';
import { PaginationInfo } from '@/types/index';

export const fetchTemplateContentList = createAction(
  'ORGANIZATION_PROJECT_CONTENT__FETCH_TEMPLATE_CONTENT_LIST',
  (params: ContentSearchParams) => ({
    ...params,
  }),
)();

export const pushTemplateContentList = createAction(
  'ORGANIZATION_PROJECT_CONTENT__PUSH_TEMPLATE_CONTENT_LIST',
  (list: ContentType[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const deleteTemplateContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__DELETE_TEMPLATE_CONTENT',
  (params: ContentDeleteParams) => ({
    ...params,
  }),
)();

export const updateTemplateContent = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_TEMPLATE_CONTENT',
  (params: ContentUpdateParams) => ({
    ...params,
  }),
)();

export const updateLoading = createAction(
  'ORGANIZATION_PROJECT_CONTENT__UPDATE_TEMPLATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const clearAll = createAction('ORGANIZATION_PROJECT_CONTENT__TEMPLATE_CLEAR_APP', () => ({}))();
