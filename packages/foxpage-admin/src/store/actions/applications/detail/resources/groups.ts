import { createAction } from 'typesafe-actions';

import {
  ApplicationResourceGroupEntity,
  ApplicationResourceGroupTypeEntity,
  ApplicationResourcesAllGroupsFetchParams,
  ApplicationResourcesGroupDeleteParams,
  ApplicationResourcesGroupSaveParams,
  ApplicationResourcesRemoteUrlFetchParams,
  OptionsAction,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_RESOURCES_GROUPS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_RESOURCES_GROUPS__UPDATE_LOADING',
  (loading: boolean) => ({ loading }),
)();

export const openEditDrawer = createAction(
  'APPLICATION_RESOURCES_GROUPS__STATE_EDIT_DRAWER_UPDATE',
  (open: boolean, editGroup?: ApplicationResourceGroupEntity) => ({
    open,
    editGroup,
  }),
)();

export const fetchResourcesGroupTypes = createAction(
  'APPLICATION_RESOURCES_GROUPS___FETCH_GROUP_TYPES',
  (params: ApplicationResourcesAllGroupsFetchParams, cb?: (groupTypeList) => void) => ({ params, cb }),
)();

export const pushResourcesGroupTypes = createAction(
  'APPLICATION_RESOURCES_GROUPS___PUSH_GROUP_TYPES',
  (groupTypeList: ApplicationResourceGroupTypeEntity[]) => ({ groupTypeList }),
)();

export const updateResourcesGroupsState = createAction(
  'APPLICATION_RESOURCES_GROUPS__STATE_UPDATE',
  (params) => ({
    params,
  }),
)();

export const resetResourcesEditDrawerState = createAction(
  'APPLICATION_RESOURCES_GROUPS__STATE_EDIT_DRAWER_RESET',
  () => ({}),
)();

export const fetchResourcesGroups = createAction(
  'APPLICATION_RESOURCES_GROUPS___FETCH_GROUPS',
  (params: ApplicationResourcesAllGroupsFetchParams, options?: OptionsAction) => ({ params, options }),
)();

export const pushResourcesGroups = createAction(
  'APPLICATION_RESOURCES_GROUPS___PUSH_GROUPS',
  (groupList: ApplicationResourceGroupEntity[]) => ({ groupList }),
)();

export const saveResourcesGroup = createAction(
  'APPLICATION_RESOURCES_GROUPS___SAVE_GROUP',
  (params: ApplicationResourcesGroupSaveParams, options?: OptionsAction) => ({ params, options }),
)();

export const deleteResourcesGroup = createAction(
  'APPLICATION_RESOURCES_GROUPS___DELETE_GROUP',
  (params: ApplicationResourcesGroupDeleteParams, options?: OptionsAction) => ({ params, options }),
)();

export const fetchResourcesRemoteUrl = createAction(
  'APPLICATION_RESOURCES_GROUPS__FETCH_RESOURCE_URL',
  (params: ApplicationResourcesRemoteUrlFetchParams) => ({ ...params }),
)();

export const pushResourcesRemoteUrl = createAction(
  'APPLICATION_RESOURCES_GROUPS___PUSH_RESOURCE_URL',
  (url: string) => ({ url }),
)();
