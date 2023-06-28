import { createAction } from 'typesafe-actions';

import {
  ComponentRemote,
  EditorComponentSaveParams,
  PaginationInfo,
  RemoteComponentFetchParams,
  RemoteComponentItem,
  RemoteResourceSavedData,
  RemoteResourceSaveParams,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PACKAGES_FAST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('APPLICATION_PACKAGES_FAST__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const updateSaving = createAction(
  'APPLICATION_PACKAGES_FAST__UPDATE_UPDATE_SAVING',
  (status: boolean) => ({
    status,
  }),
)();

export const selectGroup = createAction('APPLICATION_PACKAGES_FAST__SELECT_GROUP', (id: string) => ({
  id,
}))();

export const fetchPackages = createAction(
  'APPLICATION_PACKAGES_FAST__FETCH_PACKAGES',
  (params: RemoteComponentFetchParams) => ({ ...params }),
)();

export const pushPackages = createAction(
  'APPLICATION_PACKAGES_FAST__PUSH_PACKAGES',
  (list: RemoteComponentItem[], pageInfo?: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const updateSelected = createAction(
  'APPLICATION_PACKAGES_FAST__UPDATE_SELECTED',
  (selected: string[]) => ({
    selected,
  }),
)();

export const updateSearchName = createAction(
  'APPLICATION_PACKAGES_FAST__UPDATE_SEARCH_NAME',
  (name: string) => ({
    name,
  }),
)();

export const updateChanges = createAction(
  'APPLICATION_PACKAGES_FAST__UPDATE_CHANGES',
  (componentName: string, params: Record<string, string>) => ({ componentName, params }),
)();

export const clearChanges = createAction('APPLICATION_PACKAGES_FAST__CLEAR_CHANGES', () => ({}))();

export const saveChanges = createAction(
  'APPLICATION_PACKAGES_FAST__SAVE_CHANGES',
  (applicationId: string, cb?: () => void) => ({
    applicationId,
    cb,
  }),
)();

export const saveResources = createAction(
  'APPLICATION_PACKAGES_FAST__SAVE_RESOURCES',
  (params: RemoteResourceSaveParams, cb: (data: RemoteResourceSavedData) => void) => ({ ...params, cb }),
)();

export const pushResourcesSaved = createAction(
  'APPLICATION_PACKAGES_FAST__PUSH_RESOURCES_SAVED',
  (data: RemoteResourceSavedData) => ({ data }),
)();

export const updateComponentRemoteInfo = createAction(
  'APPLICATION_PACKAGES_FAST__UPDATE_COMPONENT_REMOTE_INFO',
  (name: string, info: Partial<ComponentRemote>) => ({ name, info }),
)();

export const saveEditors = createAction(
  'APPLICATION_PACKAGES_FAST__SAVE_EDITORS',
  (params: EditorComponentSaveParams) => ({ ...params }),
)();

export const saveComponents = createAction('APPLICATION_PACKAGES_FAST__SAVE_COMPONENTS', () => ({}))();
