import { createAction } from 'typesafe-actions';

import {
  ApplicationSettingBuilderComponent,
  ApplicationSettingBuilderDeleteParams,
  ApplicationSettingBuilderSaveParams,
  CategoryType,
  ComponentCategoryFetchParams,
  ComponentCategoryFetchRes,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_SETTINGS_BUILDER_COMPONENTS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updateSaveLoading = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE__SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const updatePageNum = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE__NUM_LOADING',
  (num: number) => ({
    num,
  }),
)();

export const updateSearchText = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE_SEARCH_TEXT',
  (search: string) => ({
    search,
  }),
)();

export const fetchComponents = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__FETCH_COMPONENTS',
  (params: ComponentCategoryFetchParams) => ({
    ...params,
  }),
)();

export const pushComponents = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__PUSH_COMPONENTS',
  (data: ComponentCategoryFetchRes) => ({
    data,
  }),
)();

export const updateEditorVisible = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE_EDITOR_VISIBLE',
  (status: boolean, data: ApplicationSettingBuilderComponent | null) => ({ status, data }),
)();

export const saveCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__SAVE_CATEGORY',
  (params: ApplicationSettingBuilderSaveParams) => ({
    params,
  }),
)();

export const removeCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__REMOVE_CATEGORY',
  (params: ApplicationSettingBuilderSaveParams) => ({
    params,
  }),
)();

export const deleteCategory = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__DELETE_CATEGORY',
  (params: ApplicationSettingBuilderDeleteParams) => ({
    params,
  }),
)();

export const fetchCategories = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__FETCH_CATEGORY',
  (applicationId: string) => ({
    applicationId,
  }),
)();

export const pushCategories = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__PUSH_CATEGORY',
  (list: CategoryType[]) => ({
    list,
  }),
)();

// modal
export const updateModalVisible = createAction(
  'APPLICATION_SETTINGS_BUILDER_COMPONENTS__UPDATE_MODAL_VISIBLE',
  (open: boolean) => ({
    open,
  }),
)();
