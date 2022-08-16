import { createAction } from 'typesafe-actions';

import {
  PaginationInfo,
  TeamEntity,
  TeamMemberEntity,
  TeamMembersFetchParams,
  TeamMembersParams,
  TeamSaveParams,
  TeamsFetchParams,
} from '@/types/index';

export const clearAll = createAction('TEAMS__CLEAR_ALL', () => ({}))();

export const updateLoading = createAction('TEAMS__UPDATE_LOADING', (status: boolean) => ({
  status,
}))();

export const fetchTeamList = createAction('TEAMS__FETCH_TEAM_LIST', (params: TeamsFetchParams) => ({
  ...params,
}))();

export const pushTeamList = createAction(
  'TEAMS__PUSH_TEAM_LIST',
  (list: TeamEntity[], pageInfo: PaginationInfo) => ({
    list,
    pageInfo,
  }),
)();

export const openDrawer = createAction('TEAMS__OPEN_EDIT_DRAWER', (status: boolean, team?: TeamEntity) => ({
  status,
  team,
}))();

export const updateEditTeamValue = createAction(
  'TEAMS__UPDATE_EDIT_TEAM_VALUE',
  (key: string, value: string) => ({
    key,
    value,
  }),
)();

export const saveTeam = createAction('TEAMS__SAVE_TEAM', (params: TeamSaveParams, cb?: () => void) => ({
  params,
  cb,
}))();

export const deleteTeam = createAction('TEAMS__DELETE_TEAM', (organizationId: string, team: TeamEntity) => ({
  organizationId,
  team,
}))();

export const openUserManagementDrawer = createAction(
  'TEAMS__OPEN_USER_MANAGEMENT_DRAWER',
  (open: boolean, team?: TeamEntity) => ({
    open,
    team,
  }),
)();

export const addTeamUsers = createAction(
  'TEAMS__ADD_TEAM_USERS',
  (params: TeamMembersParams, cb?: () => void) => ({
    params,
    cb,
  }),
)();

export const deleteTeamUsers = createAction('TEAMS__DELETE_TEAM_USERS', (params: TeamMembersParams) => ({
  params,
}))();

export const updateTeamUsersAfterDelete = createAction(
  'TEAMS__UPDATE_TEAM_USERS_AFTER_DELETE',
  (users: TeamMemberEntity[]) => ({
    users,
  }),
)();

export const updateTeamUsersAfterAdd = createAction(
  'TEAMS__UPDATE_TEAM_USERS_AFTER_ADD',
  (users: TeamMemberEntity[]) => ({
    users,
  }),
)();

// teams user detail
export const fetchTeamUsers = createAction('TEAMS__FETCH_TEAM_MEMBERS', (params: TeamMembersFetchParams) => ({
  params,
}))();

export const pushTeamUsers = createAction('TEAMS__PUSH_TEAM_MEMBERS', (users: TeamMemberEntity[]) => ({
  users,
}))();

export const updateTeamManagementLoading = createAction(
  'TEAMS__UPDATE_TEAM_MANAGEMENT_LOADING',
  (loading: boolean) => ({
    loading,
  }),
)();

// organization user list
export const fetchOrganizationUsers = createAction(
  'TEAMS__FETCH_ORGANIZATION_USERS',
  (params: TeamsFetchParams) => ({
    params,
  }),
)();

export const pushOrganizationUsers = createAction(
  'TEAMS__PUSH_ORGANIZATION_USERS',
  (users: TeamMemberEntity[]) => ({
    users,
  }),
)();
