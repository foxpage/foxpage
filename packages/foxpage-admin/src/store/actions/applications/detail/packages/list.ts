import { createAction } from 'typesafe-actions';

import { InitialDataType } from '@/reducers/applications/detail/packages/list';
import {
  AppComponentAddComponentParams,
  AppComponentDeleteComponentParams,
  AppComponentFetchComponentsParams,
  AppComponentSetComponentParams,
  CommonDrawerEntity,
  OptionsAction,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_PACKAGES_LIST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction(
  'APPLICATION_PACKAGES_LIST__UPDATE_LOADING',
  (loading: boolean) => ({ loading }),
)();

// state
export const updateListState = createAction(
  'APPLICATION_PACKAGES_LIST__UPDATE_STATE',
  (params: Partial<InitialDataType>) => ({
    params,
  }),
)();

export const updateComponentDrawerState = createAction(
  'APPLICATION_PACKAGES_LIST__UPDATE_COMPONENT_DRAWER_STATE',
  (params: Partial<CommonDrawerEntity>) => ({ params }),
)();

export const resetComponentDrawerState = createAction(
  'APPLICATION_PACKAGES_LIST__RESET_COMPONENT_DRAWER_STATE',
  () => ({}),
)();

// actions
export const fetchComponentsAction = createAction(
  'APPLICATION_PACKAGES_LIST__FETCH_COMPONENTS_API',
  (params: AppComponentFetchComponentsParams) => ({ params }),
)();

export const addComponentAction = createAction(
  'APPLICATION_PACKAGES_LIST__ADD_COMPONENT_API',
  (params: AppComponentAddComponentParams, options?: OptionsAction) => ({ params, options }),
)();

export const deleteComponentAction = createAction(
  'APPLICATION_PACKAGES_LIST__DELETE_COMPONENT_API',
  (params: AppComponentDeleteComponentParams, options?: OptionsAction) => ({ params, options }),
)();

export const setComponentAction = createAction(
  'APPLICATION_PACKAGES_LIST__SET_COMPONENT_ACTION',
  (params: AppComponentSetComponentParams, cb?: () => void) => ({ params, cb }),
)();

// actions
export const fetchBlocksAction = createAction(
  'APPLICATION_PACKAGES_LIST__FETCH_BLOCKS_API',
  (params: AppComponentFetchComponentsParams) => ({ params }),
)();
