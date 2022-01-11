import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/user';
import { OrganizationUser } from '@/types/index';

export type UserActionType = ActionType<typeof ACTIONS>;

const users: OrganizationUser[] = [];

const initialData = {
  fetching: false,
  users,
  addDrawerOpen: false,
  addedUsers: { account: '', password: '' },
};

type initialDataType = typeof initialData;

const conditionReducer = (state: initialDataType = initialData, action: UserActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }

      case getType(ACTIONS.updateAccountDrawerOpen): {
        const { open } = action.payload;
        draft.addDrawerOpen = open;
        break;
      }

      case getType(ACTIONS.pushOrganizationUsers): {
        const { users } = action.payload;
        draft.users = users;
        break;
      }

      case getType(ACTIONS.updateAddedUserInfo): {
        const { account, password } = action.payload;
        draft.addedUsers = { account, password };
        break;
      }

      default:
        break;
    }
  });

export default conditionReducer;
