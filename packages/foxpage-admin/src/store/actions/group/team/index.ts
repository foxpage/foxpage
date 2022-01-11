import { createAction } from 'typesafe-actions';

import {
  OrganizationUser,
  PaginationInfo,
  Team,
  TeamFetchParams,
  TeamUsersAddParams,
  TeamUsersFetchParams,
} from '@/types/index';

export const clearAll = createAction('ORGANIZATION_TEAM__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('ORGANIZATION_TEAM__UPDATE_LOADING', (loading: boolean) => ({ loading }))();

export const fetchTeamList = createAction('ORGANIZATION_TEAM__FETCH_TEAM_LIST', (params: TeamFetchParams) => ({
  ...params,
}))();

export const pushTeamList = createAction(
  'ORGANIZATION_TEAM__PUSH_TEAM_LIST',
  (list: Team[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const openDrawer = createAction('ORGANIZATION_TEAM__OPEN_EDIT_DRAWER', (team?: Team) => ({
  team,
}))();

export const updateEditTeamValue = createAction(
  'ORGANIZATION_TEAM__UPDATE_EDIT_TEAM_VALUE',
  (key: string, value: string) => ({
    key,
    value,
  }),
)();

export const closeDrawer = createAction('ORGANIZATION_TEAM__CLOSE_EDIT_DRAWER', () => ({}))();

export const deleteTeam = createAction('ORGANIZATION_TEAM__DELETE_TEAM', (team: Team) => ({
  team,
}))();

export const addTeam = createAction('ORGANIZATION_TEAM__ADD_TEAM', (organizationId: string, team: Team) => ({
  organizationId,
  team,
}))();

export const updateTeam = createAction('ORGANIZATION_TEAM__UPDATE_TEAM', (organizationId: string, team: Team) => ({
  organizationId,
  team,
}))();

export const updateUserManagementDrawerOpenStatus = createAction(
  'ORGANIZATION_TEAM__UPDATE_USER_MANAGEMENT_DRAWER_OPEN_STATUS',
  (open: boolean, team?: Team) => ({
    open,
    team,
  }),
)();

export const addTeamUsers = createAction('ORGANIZATION_TEAM__ADD_TEAM_USERS', (params: TeamUsersAddParams) => ({
  ...params,
}))();

export const deleteTeamUsers = createAction('ORGANIZATION_TEAM__DELETE_TEAM_USERS', (params: TeamUsersAddParams) => ({
  ...params,
}))();

export const updateTeamUsersAfterDelete = createAction(
  'ORGANIZATION_TEAM__UPDATE_TEAM_USERS_AFTER_DELETE',
  (users: OrganizationUser[]) => ({
    users,
  }),
)();

export const updateTeamUsersAfterAdd = createAction(
  'ORGANIZATION_TEAM__UPDATE_TEAM_USERS_AFTER_ADD',
  (users: OrganizationUser[]) => ({
    users,
  }),
)();

export const fetchTeamUsers = createAction('ORGANIZATION_TEAM__FETCH_TEAM_MEMBERS', (params: TeamUsersFetchParams) => ({
  ...params,
}))();

export const pushTeamUsers = createAction('ORGANIZATION_TEAM__PUSH_TEAM_MEMBERS', (users: OrganizationUser[]) => ({
  users,
}))();

export const updateTeamManagementLoading = createAction(
  'ORGANIZATION_TEAM__UPDATE_TEAM_MANAGEMENT_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();
