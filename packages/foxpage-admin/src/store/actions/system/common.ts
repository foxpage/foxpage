import { createAction } from 'typesafe-actions';

import { TeamMemberEntity, TeamMembersFetchParams, UserOrganization } from '@/types/index';

export const fetchOrganizationList = createAction('SYSTEM__FETCH_ORGANIZATION_LIST', () => ({}))();

export const pushOrganizationList = createAction(
  'SYSTEM__PUSH_ORGANIZATION_LIST',
  (list: UserOrganization[]) => ({
    list,
  }),
)();

export const fetchTeamMembers = createAction(
  'SYSTEM__FETCH_TEAM_MEMBERS',
  (params: TeamMembersFetchParams) => ({
    params,
  }),
)();

export const pushTeamMembers = createAction('SYSTEM__PUSH_TEAM_MEMBERS', (members: TeamMemberEntity[]) => ({
  members,
}))();
