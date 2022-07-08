import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system';
import { UserOrganization } from '@/types/user';
import { getLoginUser } from '@/utils/login-user';

export type SystemActionType = ActionType<typeof ACTIONS>;

const organizations: UserOrganization[] = [];
const { organizationId } = getLoginUser();

const initialState = {
  organizations,
  organizationId: organizationId || '',
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: SystemActionType) =>
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
