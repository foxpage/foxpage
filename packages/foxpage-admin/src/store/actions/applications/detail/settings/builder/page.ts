import { createAction } from 'typesafe-actions';

import {
  ApplicationSettingBuilderDeleteParams,
  ApplicationSettingBuilderFetchParams,
  ApplicationSettingBuilderSaveParams,
  ProjectPageTemplateContentFetchParams,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_SETTINGS_BUILDER_PAGES__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__UPDATE__SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePageNum = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__UPDATE__NUM_LOADING',
  (num: number) => ({
    num,
  }),
)();

export const updateSearchText = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__UPDATE_SEARCH_TEXT',
  (search: string) => ({
    search,
  }),
)();

export const updateModalState = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__UPDATE_MODAL_STATE',
  (data: any) => ({
    data,
  }),
)();

export const fetchPages = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__FETCH_PAGES',
  (params: ApplicationSettingBuilderFetchParams) => ({
    params,
  }),
)();

export const pushPages = createAction('APPLICATION_SETTINGS_BUILDER_PAGES__PUSH_PAGES', (data: any) => ({
  data,
}))();

export const saveCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__SAVE_CATEGORY',
  (params: ApplicationSettingBuilderSaveParams) => ({
    params,
  }),
)();

export const deleteCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__DELETE_CATEGORY',
  (params: ApplicationSettingBuilderDeleteParams) => ({
    params,
  }),
)();

export const fetchPagesContent = createAction(
  'APPLICATION_SETTINGS_BUILDER_PAGES__FETCH_PAGES_CONTENT',
  (params: ProjectPageTemplateContentFetchParams) => ({
    params,
  }),
)();
