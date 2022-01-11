import { createAction } from 'typesafe-actions';

import {
  AddOrganizationUserParams,
  DeleteOrganizationUserParams,
  OrganizationUser,
  OrganizationUserSearchParams,
  TeamFetchParams,
} from '@/types/index';

export const clearAll = createAction('ORGANIZATION_USER__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('ORGANIZATION_USER__UPDATE_LOADING', (loading: boolean) => ({ loading }))();

export const fetchOrganizationUsers = createAction(
  'ORGANIZATION_USER__FETCH_USER_LIST',
  (params: OrganizationUserSearchParams) => ({
    ...params,
  }),
)();

export const pushOrganizationUsers = createAction('ORGANIZATION_USER__PUSH_USER_LIST', (users: OrganizationUser[]) => ({
  users,
}))();

export const deleteOrganizationUser = createAction(
  'ORGANIZATION_USER__DELETE_USER',
  (params: DeleteOrganizationUserParams) => ({
    ...params,
  }),
)();

export const addOrganizationUser = createAction('ORGANIZATION_USER__ADD_USER', (user: AddOrganizationUserParams) => ({
  ...user,
}))();

export const searchUsers = createAction('ORGANIZATION_USER__ADD_USER', (params: TeamFetchParams) => ({
  params,
}))();

export const updateAccountDrawerOpen = createAction(
  'ORGANIZATION_USER__UPDATE_ADD_ACCOUNT_DRAWER_OPEN_STATUS',
  (open: boolean) => ({
    open,
  }),
)();

export const updateAddedUserInfo = createAction(
  'ORGANIZATION_USER__UPDATE_ADDED_USER_INFO',
  (userInfo: { account: string; password: string }) => ({
    ...userInfo,
  }),
)();
