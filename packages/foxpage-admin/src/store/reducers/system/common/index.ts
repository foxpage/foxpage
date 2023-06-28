import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/common';
import { TeamMemberEntity } from '@/types/index';

export type SystemActionType = ActionType<typeof ACTIONS>;

const administrators: TeamMemberEntity[] = [];
const initialState = {
  administrators,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: SystemActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.pushTeamMembers): {
        draft.administrators = action.payload.members;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
