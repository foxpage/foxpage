import { createAction } from 'typesafe-actions';

import { StateType } from '@/reducers/group/application/resource/detail';
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

// state
export const updateResourcesDetailState = createAction(
  'ORG_APP_RESOURCES_DETAIL__UPDATE_STATE',
  (params: Partial<StateType>) => ({
    params,
  }),
)();
export const resetResourcesDetailState = createAction('ORG_APP_RESOURCES_DETAIL__RESET_STATE', () => ({}))();

export const updateResourcesDetailFolderDrawerState = createAction(
  'ORG_APP_RESOURCES_DETAIL__FOLDER_DRAWER_UPDATE_STATE',
  (params: Partial<StateType['folderDrawer']>) => ({
    params,
  }),
)();
export const resetResourcesDetailFolderDrawerState = createAction(
  'ORG_APP_RESOURCES_DETAIL__FOLDER_DRAWER_RESET_STATE',
  () => ({}),
)();

export const updateResourcesDetailFileDrawerState = createAction(
  'ORG_APP_RESOURCES_DETAIL__FILE_DRAWER_UPDATE_STATE',
  (params: Partial<StateType['fileDrawer']>) => ({
    params,
  }),
)();
export const resetResourcesDetailFileDrawerState = createAction(
  'ORG_APP_RESOURCES_DETAIL__FILE_DRAWER_RESET_STATE',
  () => ({}),
)();

// actions
export const fetchResourcesListAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__FETCH_RESOURCES_LIST_API',
  (params: AppResourcesDetailsFetchResourcesListParams, options?: OptionsAction) => ({ params, options }),
)();

export const fetchGroupInfoAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__FETCH_GROUP_INFO_API',
  (params: AppResourcesDetailsFetchGroupInfoParams, options?: OptionsAction) => ({ params, options }),
)();

export const addFileAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__ADD_FILE_API',
  (params: AppResourcesDetailsAddFileParams, options?: OptionsAction) => ({ params, options }),
)();
export const updateFileAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__UPDATE_FILE_API',
  (params: AppResourcesDetailsUpdateFileParams, options?: OptionsAction) => ({ params, options }),
)();

export const addFolderAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__ADD_FOLDER_API',
  (params: AppResourcesDetailsAddFolderParams, options?: OptionsAction) => ({ params, options }),
)();
export const updateFolderAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__UPDATE_FOLDER_API',
  (params: AppResourcesDetailsUpdateFolderParams, options?: OptionsAction) => ({ params, options }),
)();

export const removeResourcesAction = createAction(
  'ORG_APP_RESOURCES_DETAIL__REMOVE_RESOURCES_API',
  (params: AppResourcesDetailsRemoveResourcesParams, options?: OptionsAction) => ({ params, options }),
)();
// emit to call api
