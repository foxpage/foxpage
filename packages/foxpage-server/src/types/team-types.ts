import { Team } from '@foxpage/foxpage-server-types';

import { Search } from './index-types';

export type NewTeamParams = Pick<Team, 'id' | 'name' | 'organizationId' | 'creator'>;
export type UpdateTeamParams = Pick<Team, 'id' | 'name'>;
export type SearchTeamExist = Pick<Team, 'name' | 'organizationId'>;
export type TeamInfo = Exclude<Team, 'creator' | 'members'> & {
  creator: { id: string; account: string };
} & {
  memberCount: number;
};

export interface TeamSearch extends Search {
  organizationId: string;
}
