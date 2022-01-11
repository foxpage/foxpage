import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/register';

export type RegisterActionType = ActionType<typeof ACTIONS>;

const initialState = {
  loading: false,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: RegisterActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.updateRegisterLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
