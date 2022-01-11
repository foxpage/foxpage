import { createAction } from 'typesafe-actions';

import { Application, ApplicationFetchParams, ApplicationFetchResponse } from '@/types/index';

// TODO: will remove
export const FETCH_LIST = 'APPLICATION_LIST__FETCH_LIST';
export const FETCH_LIST_SUCCEED = 'APPLICATION_LIST__FETCH_LIST_SUCCEED';
export const SET_PAGE_NO = 'APPLICATION_LIST__SET_PAGE_NO';
export const OPEN_UP_INSERT_DRAWER = 'APPLICATION_LIST__OPEN_UP_INSERT_DRAWER';
export const CLOSE_UP_INSERT_DRAWER = 'APPLICATION_LIST__CLOSE_UP_INSERT_DRAWER';
export const SAVE_APP = 'APPLICATION_LIST__SAVE_APP';
export const UPDATE_VALUE = 'APPLICATION_LIST__UPDATE_VALUE';

export const clearAll = createAction('APPLICATION_LIST__CLEAR_ALL', () => ({}))();

export const updateFetching = createAction('APPLICATION_LIST__UPDATE_FETCHING', (status: boolean) => ({ status }))();
export const updateSaving = createAction('APPLICATION_LIST__UPDATE_SAVING', (status: boolean) => ({ status }))();

export const fetchList = createAction('APPLICATION_LIST__FETCH_LIST', (params: ApplicationFetchParams) => ({
  params,
}))();

export const pushAppList = createAction('APPLICATION_LIST__FETCH_LIST_SUCCEED', (result: ApplicationFetchResponse) => ({
  result,
}))();

export const changePageNum = createAction('APPLICATION_LIST__CHANGE_PAGE_NUM', (pageNo: number) => ({
  pageNo,
}))();

export const updateDrawerVisible = createAction(
  'APPLICATION_LIST__UPDATE_DRAWER_VISIBLE',
  (visible: boolean, app?: Application) => ({
    visible,
    app,
  }),
)();

export const saveApp = createAction('APPLICATION_LIST__SAVE_APP', () => ({}))();

export const updateApp = createAction('APPLICATION_LIST__UPDATE_APP', (key: string, value: unknown) => ({
  key,
  value,
}))();

export const updateValue = createAction('APPLICATION_LIST__UPDATE_VALUE', (key: string, value: unknown) => ({
  key,
  value,
}))();
