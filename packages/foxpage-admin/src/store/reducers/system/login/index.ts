import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/login';

export type LoginActionType = ActionType<typeof ACTIONS>;

const initialState = {
  loading: false,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: LoginActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
