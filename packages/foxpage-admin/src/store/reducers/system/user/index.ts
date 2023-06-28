import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/user';
import { UserOrganization } from '@/types/index';
import { getLoginUser } from '@/utils/index';

export type UserActionType = ActionType<typeof ACTIONS>;

const { userInfo } = getLoginUser();
const organizations: UserOrganization[] = [];

const initialState = {
  organizations,
  organizationId: userInfo?.organizationId || '',
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: UserActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.pushOrganizationList): {
        draft.organizations = action.payload.list;
        break;
      }

      case getType(ACTIONS.updateOrganizationId): {
        draft.organizationId = action.payload.id;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
