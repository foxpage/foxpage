import { createAction } from 'typesafe-actions';

import { StateType } from '@/reducers/group/application/resource/groups';
import {
  AppResourcesGroupsDeleteResourcesGroupParams,
  AppResourcesGroupsFetchResourcesGroupsParams,
  AppResourcesGroupsSaveResourcesGroupParams,
  OptionsAction,
} from '@/types/index';

// state
export const updateResourcesGroupsState = createAction(
  'ORG_APP_RESOURCES_GROUPS_STATE_UPDATE',
  (params: Partial<StateType>) => ({
    params,
  }),
)();
export const resetResourcesGroupsState = createAction('ORG_APP_RESOURCES_GROUPS_STATE_RESET', () => ({}))();
export const updateResourcesEditDrawerState = createAction(
  'ORG_APP_RESOURCES_GROUPS_STATE_EDIT_DRAWER_UPDATE',
  (params: Partial<StateType['editDrawer']>) => ({
    params,
  }),
)();
export const resetResourcesEditDrawerState = createAction(
  'ORG_APP_RESOURCES_GROUPS_STATE_EDIT_DRAWER_RESET',
  () => ({}),
)();

// actions
export const fetchResourcesGroupsAction = createAction(
  'ORG_APP_RESOURCES_GROUPS__FETCH_GROUP',
  (params: AppResourcesGroupsFetchResourcesGroupsParams, options?: OptionsAction) => ({ params, options }),
)();

export const saveResourcesGroupAction = createAction(
  'ORG_APP_RESOURCES_GROUPS__ADD_GROUP',
  (params: AppResourcesGroupsSaveResourcesGroupParams, options?: OptionsAction) => ({ params, options }),
)();

export const deleteResourcesGroupAction = createAction(
  'ORG_APP_RESOURCES_GROUPS__DELETE_GROUP',
  (params: AppResourcesGroupsDeleteResourcesGroupParams, options?: OptionsAction) => ({ params, options }),
)();
