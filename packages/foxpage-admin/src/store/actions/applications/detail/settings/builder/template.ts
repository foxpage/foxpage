import { createAction } from 'typesafe-actions';

import {
  ApplicationSettingBuilderDeleteParams,
  ApplicationSettingBuilderFetchParams,
  ApplicationSettingBuilderSaveParams,
  ComponentCategoryFetchRes,
  ProjectPageTemplateContentFetchParams,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_SETTINGS_BUILDER_TEMPLATES__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__UPDATE__SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePageNum = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__UPDATE__NUM_LOADING',
  (num: number) => ({
    num,
  }),
)();

export const updateSearchText = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__UPDATE_SEARCH_TEXT',
  (search: string) => ({
    search,
  }),
)();

export const updateModalState = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__UPDATE_MODAL_STATE',
  (data: any) => ({
    data,
  }),
)();

export const fetchTemplates = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__FETCH_TEMPLATES',
  (params: ApplicationSettingBuilderFetchParams) => ({
    params,
  }),
)();

export const pushTemplates = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__PUSH_TEMPLATES',
  (data: ComponentCategoryFetchRes) => ({
    data,
  }),
)();

export const saveCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__SAVE_CATEGORY',
  (params: ApplicationSettingBuilderSaveParams) => ({
    params,
  }),
)();

export const deleteCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__DELETE_CATEGORY',
  (params: ApplicationSettingBuilderDeleteParams) => ({
    params,
  }),
)();

export const fetchTemplatesContent = createAction(
  'APPLICATION_SETTINGS_BUILDER_TEMPLATES__FETCH_TEMPLATES_CONTENT',
  (params: ProjectPageTemplateContentFetchParams) => ({
    params,
  }),
)();
