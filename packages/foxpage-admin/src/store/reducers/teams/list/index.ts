import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import { PaginationInfo, TeamEntity, TeamMemberEntity } from '@/types/index';

export type TeamsActionType = ActionType<typeof ACTIONS>;

const list: TeamEntity[] = [];
const defaultEditTeam: TeamEntity = {} as TeamEntity;
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const organizationUsers: TeamMemberEntity[] = [];

const initialState = {
  fetching: false,
  pageInfo,
  list,
  editTeam: defaultEditTeam,
  editDrawerOpen: false,
  userManagementDrawerOpen: false,
  managementTeam: defaultEditTeam,
  managementTeamLoading: false,
  organizationUsers,
};

type InitialDataType = typeof initialState;

const conditionReducer = (state: InitialDataType = initialState, action: TeamsActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.fetching = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushTeamList): {
        draft.list = action.payload.list;
        draft.pageInfo = action.payload.pageInfo;
        break;
      }

      case getType(ACTIONS.openDrawer): {
        draft.editDrawerOpen = action.payload.status;
        draft.editTeam = action.payload?.team || defaultEditTeam;
        break;
      }

      case getType(ACTIONS.openUserManagementDrawer): {
        draft.managementTeam = action.payload?.team || defaultEditTeam;
        draft.userManagementDrawerOpen = action.payload.open;
        break;
      }

      case getType(ACTIONS.updateEditTeamValue): {
        const { key, value } = action.payload;
        const newEditTeam = Object.assign({}, draft.editTeam);
        newEditTeam[key] = value;
        draft.editTeam = newEditTeam;
        break;
      }

      case getType(ACTIONS.updateTeamUsersAfterAdd): {
        const { users } = action.payload;
        const managementTeam = _.cloneDeep(draft.managementTeam);
        managementTeam.members = managementTeam.members.concat(users);
        draft.managementTeam = managementTeam;
        break;
      }

      case getType(ACTIONS.updateTeamUsersAfterDelete): {
        const { users } = action.payload;
        const managementTeam = _.cloneDeep(draft.managementTeam);
        managementTeam.members = managementTeam.members.filter(
          (item) => !users.find((user) => item.userId === user.userId),
        );
        draft.managementTeam = managementTeam;
        break;
      }

      case getType(ACTIONS.pushTeamUsers): {
        const { users } = action.payload;
        const managementTeam = _.cloneDeep(draft.managementTeam);
        managementTeam.members = users;
        draft.managementTeam = managementTeam;
        draft.managementTeamLoading = false;
        break;
      }

      case getType(ACTIONS.updateTeamManagementLoading): {
        draft.managementTeamLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.pushOrganizationUsers): {
        draft.organizationUsers = action.payload.users;
        break;
      }

      default:
        break;
    }
  });

export default conditionReducer;
