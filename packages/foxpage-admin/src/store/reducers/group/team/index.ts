import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/team';
import { PaginationInfo } from '@/types/index';
import { Team } from '@/types/team';

export type TeamActionType = ActionType<typeof ACTIONS>;

const list: Team[] = [];
const defaultEditTeam: Team = {} as Team;
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };

const initialData = {
  fetching: false,
  list,
  editTeam: defaultEditTeam,
  editDrawerOpen: false,
  userManagementDrawerOpen: false,
  pageInfo,
  managementTeam: defaultEditTeam,
  managementTeamLoading: false,
};

type initialDataType = typeof initialData;

const conditionReducer = (state: initialDataType = initialData, action: TeamActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.pushTeamList): {
        const { list, pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.openDrawer): {
        const { team } = action.payload;
        draft.editTeam = team || defaultEditTeam;
        draft.editDrawerOpen = true;
        break;
      }

      case getType(ACTIONS.updateUserManagementDrawerOpenStatus): {
        const { open, team } = action.payload;
        draft.managementTeam = team || defaultEditTeam;
        draft.userManagementDrawerOpen = open;
        break;
      }

      case getType(ACTIONS.closeDrawer): {
        draft.editTeam = defaultEditTeam;
        draft.editDrawerOpen = false;
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
        const newUsers = managementTeam.members.concat(users);
        managementTeam.members = newUsers;
        draft.managementTeam = managementTeam;
        break;
      }

      case getType(ACTIONS.updateTeamUsersAfterDelete): {
        const { users } = action.payload;
        const managementTeam = _.cloneDeep(draft.managementTeam);
        const newUsers = managementTeam.members.filter(item => !users.find(user => item.userId === user.userId));
        managementTeam.members = newUsers;
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
        const { loading } = action.payload;
        draft.managementTeamLoading = loading;
        break;
      }

      default:
        break;
    }
  });

export default conditionReducer;
