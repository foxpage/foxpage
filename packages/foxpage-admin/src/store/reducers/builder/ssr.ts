import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';

const initialState = {
  renderHtml: '',
};

export type SsrActionType = ActionType<typeof ACTIONS>;

const reducer = (state = initialState, action: SsrActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushSsrHtml): {
        const { data } = action.payload;
        draft.renderHtml = data;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        return state;
    }
  });

export default reducer;
