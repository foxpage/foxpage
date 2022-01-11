import { createAction } from 'typesafe-actions';

import { IWindow } from '@/types/index';

export const loadComponent = createAction('BUILDER__COMPONENT_LOAD', (win: IWindow) => ({ win }))();

export const pushLoadedResource = createAction(
  'BUILDER__COMPONENT_PUSH_LOADED_RESOURCE',
  (loadResult, keys: string[]) => ({
    loadResult,
    keys,
  }),
)();

export const clearLoadedResource = createAction('BUILDER__COMPONENT_CLEAR_LOADED_RESOURCE', () => ({}))();

export const updateLoadingStatus = createAction('BUILDER__COMPONENT_LOAD_UPDATE_LOADING', (value: boolean) => ({
  value,
}))();

export const pushNoResourceComponentName = createAction(
  'BUILDER__COMPONENT_PUSH_NO_RESOURCE_COMPONENT_NAME',
  (names: string[]) => ({
    names,
  }),
)();

export const updateRequireLoadStatus = createAction(
  'BUILDER__COMPONENT_LOAD_UPDATE_REQUIRE_LOAD_STATUS',
  (status: boolean) => ({ status }),
)();
