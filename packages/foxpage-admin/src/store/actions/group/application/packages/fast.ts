import { createAction } from 'typesafe-actions';

import {
  EditorComponentSaveParams,
  RemoteComponentFetchParams,
  RemoteComponentItem,
  RemoteResourceSavedData,
  RemoteResourceSaveParams,
} from '@/types/application';
import { PaginationInfo } from '@/types/common';

export const clearAll = createAction('PACKAGE_FAST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('PACKAGE_FAST__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaving = createAction('PACKAGE_FAST__UPDATE_UPDATE_SAVING', (status: boolean) => ({
  status,
}))();

export const selectGroup = createAction('PACKAGE_FAST__SELECT_GROUP', (id: string) => ({
  id,
}))();

export const fetchPackages = createAction(
  'PACKAGE_FAST__FETCH_PACKAGES',
  (params: RemoteComponentFetchParams) => ({ ...params }),
)();

export const pushPackages = createAction(
  'PACKAGE_FAST__PUSH_PACKAGES',
  (list: RemoteComponentItem[], pageInfo?: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const updateSelected = createAction('PACKAGE_FAST__UPDATE_SELECTED', (selected: string[]) => ({
  selected,
}))();

export const updateSearchName = createAction('PACKAGE_FAST__UPDATE_SEARCH_NAME', (name: string) => ({
  name,
}))();

export const updateChanges = createAction(
  'PACKAGE_FAST__UPDATE_CHANGES',
  (componentName: string, params: Record<string, string>) => ({ componentName, params }),
)();

export const clearChanges = createAction('PACKAGE_FAST__CLEAR_CHANGES', () => ({}))();

export const saveChanges = createAction('PACKAGE_FAST__SAVE_CHANGES', (applicationId: string, cb?: () => void) => ({
  applicationId, cb
}))();

export const saveResources = createAction(
  'PACKAGE_FAST__SAVE_RESOURCES',
  (params: RemoteResourceSaveParams, cb: (data: RemoteResourceSavedData) => void) => ({ ...params, cb }),
)();
export const pushResourcesSaved = createAction(
  'PACKAGE_FAST__PUSH_RESOURCES_SAVED',
  (data: RemoteResourceSavedData) => ({ data }),
)();

export const saveEditors = createAction(
  'PACKAGE_FAST__SAVE_EDITORS',
  (params: EditorComponentSaveParams) => ({ ...params }),
)();

export const saveComponents = createAction('PACKAGE_FAST__SAVE_COMPONENTS', () => ({}))();
