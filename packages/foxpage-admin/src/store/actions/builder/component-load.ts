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

export const updateLoadingStatus = createAction('BUILDER__COMPONENT_LOAD_UPDATE_LOADING', (value: boolean) => ({
  value,
}))();

export const updateRequireLoadStatus = createAction(
  'BUILDER__COMPONENT_LOAD_UPDATE_REQUIRE_LOAD_STATUS',
  (status: boolean) => ({ status }),
)();
