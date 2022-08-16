import { createAction } from 'typesafe-actions';

import { Application, ApplicationListFetchParams, PaginationInfo } from '@/types/index';

export const clearAll = createAction('APPLICATIONS_LIST__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('APPLICATIONS_LIST__UPDATE_LOADING', (loading: boolean) => ({
  loading,
}))();

export const updateSaveLoading = createAction(
  'APPLICATIONS_LIST__UPDATE_SAVE_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

export const fetchList = createAction(
  'APPLICATION_LISTS__FETCH_LIST',
  (params: ApplicationListFetchParams) => ({
    params,
  }),
)();

export const pushList = createAction(
  'APPLICATIONS_LIST__FETCH_LIST_SUCCEED',
  (applicationList: Application[], pageInfo: PaginationInfo) => ({
    applicationList,
    pageInfo,
  }),
)();

// add
export const openEditDrawer = createAction(
  'APPLICATIONS_LIST__OPEN_EDIT_DRAWER',
  (visible: boolean, app?: Application) => ({
    visible,
    app,
  }),
)();

export const saveApp = createAction('APPLICATIONS_LIST__SAVE_APP', () => ({}))();

export const updateApp = createAction('APPLICATIONS_LIST__UPDATE_APP', (key: string, value: unknown) => ({
  key,
  value,
}))();

export const updateValue = createAction('APPLICATIONS_LIST__UPDATE_VALUE', (key: string, value: unknown) => ({
  key,
  value,
}))();
