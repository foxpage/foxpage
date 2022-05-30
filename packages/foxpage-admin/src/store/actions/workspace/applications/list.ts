import { createAction } from 'typesafe-actions';

import { Application, ApplicationFetchParams, ApplicationFetchResponse } from '@/types/index';

export const clearAll = createAction('WORKSPACE_APPLICATION_LIST__CLEAR_ALL', () => ({}))();
export const updateFetching = createAction(
  'WORKSPACE_APPLICATION_LIST__UPDATE_FETCHING',
  (status: boolean) => ({
    status,
  }),
)();
export const fetchList = createAction('APPLICATION_LISTS__FETCH_LIST', (params: ApplicationFetchParams) => ({
  params,
}))();
export const pushList = createAction(
  'WORKSPACE_APPLICATION_LIST__FETCH_LIST_SUCCEED',
  (result: ApplicationFetchResponse) => ({
    result,
  }),
)();

// add
export const updateSaving = createAction('WORKSPACE_APPLICATION_LIST__UPDATE_SAVING', (status: boolean) => ({
  status,
}))();

export const updateDrawerVisible = createAction(
  'WORKSPACE_APPLICATION_LIST__UPDATE_DRAWER_VISIBLE',
  (visible: boolean, app?: Application) => ({
    visible,
    app,
  }),
)();

export const saveApp = createAction('WORKSPACE_APPLICATION_LIST__SAVE_APP', () => ({}))();

export const updateApp = createAction(
  'WORKSPACE_APPLICATION_LIST__UPDATE_APP',
  (key: string, value: unknown) => ({
    key,
    value,
  }),
)();

export const updateValue = createAction(
  'WORKSPACE_APPLICATION_LIST__UPDATE_VALUE',
  (key: string, value: unknown) => ({
    key,
    value,
  }),
)();
