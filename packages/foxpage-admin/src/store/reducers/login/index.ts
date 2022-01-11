import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/login';

export type LoginActionType = ActionType<typeof ACTIONS>;

const initialState = {
  loading: false,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: LoginActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.updateLoginLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
