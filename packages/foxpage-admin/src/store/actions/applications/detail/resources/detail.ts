import { createAction } from 'typesafe-actions';

import {
  AppResourcesDetailsAddFileParams,
  AppResourcesDetailsAddFolderParams,
  AppResourcesDetailsFetchGroupInfoParams,
  AppResourcesDetailsFetchResourcesListParams,
  AppResourcesDetailsRemoveResourcesParams,
  AppResourcesDetailsUpdateFileParams,
  AppResourcesDetailsUpdateFolderParams,
  OptionsAction,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_RESOURCES_DETAIL__CLEAR_ALL', () => ({}))();

export const updateFolderPath = createAction(
  'APPLICATION_RESOURCES_DETAIL__UPDATE_FOLDER_PATH',
  (folderPath: string) => ({
    folderPath,
  }),
)();

export const updateSelectedRowKeys = createAction(
  'APPLICATION_RESOURCES_DETAIL__UPDATE_SELECTED_ROW_KEYS',
  (keys: string[]) => ({
    keys,
  }),
)();

export const updateResourcesDetailState = createAction(
  'APPLICATION_RESOURCES_DETAIL__UPDATE_STATE',
  (params: any) => ({
    params,
  }),
)();

export const updateResourcesDetailFolderDrawerState = createAction(
  'APPLICATION_RESOURCES_DETAIL__FOLDER_DRAWER_UPDATE_STATE',
  (params) => ({
    params,
  }),
)();

export const resetResourcesDetailFolderDrawerState = createAction(
  'APPLICATION_RESOURCES_DETAIL__FOLDER_DRAWER_RESET_STATE',
  () => ({}),
)();

export const updateResourcesDetailFileDrawerState = createAction(
  'APPLICATION_RESOURCES_DETAIL__FILE_DRAWER_UPDATE_STATE',
  (params) => ({
    params,
  }),
)();

export const resetResourcesDetailFileDrawerState = createAction(
  'APPLICATION_RESOURCES_DETAIL__FILE_DRAWER_RESET_STATE',
  () => ({}),
)();

// actions
export const fetchResourcesList = createAction(
  'APPLICATION_RESOURCES_DETAIL__FETCH_RESOURCES_LIST',
  (params: AppResourcesDetailsFetchResourcesListParams, options?: OptionsAction) => ({ params, options }),
)();

export const fetchGroupInfo = createAction(
  'APPLICATION_RESOURCES_DETAIL__FETCH_GROUP_INFO',
  (params: AppResourcesDetailsFetchGroupInfoParams, options?: OptionsAction) => ({ params, options }),
)();

export const addFile = createAction(
  'APPLICATION_RESOURCES_DETAIL__ADD_FILE',
  (params: AppResourcesDetailsAddFileParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateFile = createAction(
  'APPLICATION_RESOURCES_DETAIL__UPDATE_FILE',
  (params: AppResourcesDetailsUpdateFileParams, options?: OptionsAction) => ({ params, options }),
)();

export const addFolder = createAction(
  'APPLICATION_RESOURCES_DETAIL__ADD_FOLDER',
  (params: AppResourcesDetailsAddFolderParams, options?: OptionsAction) => ({ params, options }),
)();

export const updateFolder = createAction(
  'APPLICATION_RESOURCES_DETAIL__UPDATE_FOLDER',
  (params: AppResourcesDetailsUpdateFolderParams, options?: OptionsAction) => ({ params, options }),
)();

export const removeResources = createAction(
  'APPLICATION_RESOURCES_DETAIL__REMOVE_RESOURCES',
  (params: AppResourcesDetailsRemoveResourcesParams, options?: OptionsAction) => ({ params, options }),
)();
