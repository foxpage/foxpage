import { createAction } from 'typesafe-actions';

import { ComponentDrawerType, StateType } from '@/store/reducers/group/application/packages/list';
import {
  AppComponentAddComponentParams,
  AppComponentDeleteComponentParams,
  AppComponentFetchComponentsParams,
  OptionsAction,
} from '@/types/index';
// state
export const updateListState = createAction('ORG_APP_COMPONENT_LIST__UPDATE_STATE', (params: Partial<StateType>) => ({
  params,
}))();
export const resetListState = createAction('ORG_APP_COMPONENT_LIST__RESET_STATE', () => ({}))();
export const updateComponentDrawerState = createAction(
  'ORG_APP_COMPONENT_LIST__UPDATE_COMPONENT_DRAWER_STATE',
  (params: Partial<ComponentDrawerType>) => ({ params }),
)();
export const resetComponentDrawerState = createAction(
  'ORG_APP_COMPONENT_LIST__RESET_COMPONENT_DRAWER_STATE',
  () => ({}),
)();

// actions
export const fetchComponentsAction = createAction(
  'ORG_APP_COMPONENT_LIST__FETCH_COMPONENTS_API',
  (params: AppComponentFetchComponentsParams, options?: OptionsAction) => ({ params, options }),
)();

export const addComponentAction = createAction(
  'ORG_APP_COMPONENT_LIST__ADD_COMPONENT_API',
  (params: AppComponentAddComponentParams, options?: OptionsAction) => ({ params, options }),
)();

export const deleteComponentAction = createAction(
  'ORG_APP_COMPONENT_LIST__DELETE_COMPONENT_API',
  (params: AppComponentDeleteComponentParams, options?: OptionsAction) => ({ params, options }),
)();
