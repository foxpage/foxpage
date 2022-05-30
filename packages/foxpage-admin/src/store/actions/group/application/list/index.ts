import { createAction } from 'typesafe-actions';

import {
  Application,
  ApplicationFetchParams,
  ApplicationFetchResponse,
  AuthorizeAddParams,
  AuthorizeDeleteParams,
  AuthorizeListFetchParams,
  AuthorizeListItem,
  AuthorizeUserFetchParams,
  User,
} from '@/types/index';

export const clearAll = createAction('APPLICATION_LIST__CLEAR_ALL', () => ({}))();

export const updateFetching = createAction('APPLICATION_LIST__UPDATE_FETCHING', (status: boolean) => ({
  status,
}))();
export const updateSaving = createAction('APPLICATION_LIST__UPDATE_SAVING', (status: boolean) => ({
  status,
}))();

export const fetchList = createAction('APPLICATION_LIST__FETCH_LIST', (params: ApplicationFetchParams) => ({
  params,
}))();

export const pushAppList = createAction(
  'APPLICATION_LIST__FETCH_LIST_SUCCEED',
  (result: ApplicationFetchResponse) => ({
    result,
  }),
)();

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

// authorize
export const fetchAuthList = createAction(
  'APPLICATION_LIST__FETCH_AUTH_LIST',
  (params: AuthorizeListFetchParams) => ({ params }),
)();

export const pushAuthList = createAction('APPLICATION_LIST__PUSH_AUTH_LIST', (list: AuthorizeListItem[]) => ({
  list,
}))();

export const updateAuthListLoading = createAction(
  'APPLICATION_LIST__UPDATE_AUTH_LIST_LOADING',
  (status: boolean) => ({
    status,
  }),
)();

export const updateAuthDrawerVisible = createAction(
  'APPLICATION_LIST__UPDATE_AUTH_DRAWER_VISIBLE',
  (visible = false, editApp?: Partial<Application>) => ({
    visible,
    editApp,
  }),
)();

export const authAddUser = createAction(
  'APPLICATION_LIST__AUTH_ADD_USER',
  (params: AuthorizeAddParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const authDeleteUser = createAction(
  'APPLICATION_LIST__AUTH_DELETE_USER',
  (params: AuthorizeDeleteParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const fetchUserList = createAction(
  'APPLICATION_LIST___FETCH_USER_LIST',
  (params: AuthorizeUserFetchParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const pushUserList = createAction('APPLICATION_LIST___PUSH_USER_LIST', (list: User[]) => ({
  list,
}))();
