import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/builder/locker';

const initialState = {
  clientUpdateTime: null,
};

type InitialDataType = typeof initialState;
type BuilderLockerActionType = ActionType<typeof ACTIONS>;

const reducer = (state: InitialDataType = initialState, action: BuilderLockerActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.updateClientContentTime): {
        draft.clientUpdateTime = action.payload.clientUpdateTime;
        break;
      }
      case getType(ACTIONS.resetClientContentTime): {
        draft.clientUpdateTime = initialState.clientUpdateTime;
        break;
      }
      default:
        break;
    }
  });

export default reducer;
