import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/register';

export type RegisterActionType = ActionType<typeof ACTIONS>;

const initialState = {
  loading: false,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: RegisterActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.loading;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
