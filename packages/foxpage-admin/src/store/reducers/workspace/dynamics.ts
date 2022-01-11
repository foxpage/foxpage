import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics';
import { PaginationInfo } from '@/types/common';
import { Dynamic } from '@/types/workspace';

export type DynamicActionType = ActionType<typeof ACTIONS>;

interface StateType {
  dynamics: Dynamic[];
  loading: boolean;
  pageInfo: PaginationInfo;
}
const initialState = {
  loading: false,
  dynamics: [],
  pageInfo: { page: 1, size: 10, total: 1 },
};

const reducer = (state: StateType = initialState, action: DynamicActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushDynamics): {
        const { dynamics, pageInfo } = action.payload;
        draft.dynamics = dynamics;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        break;
    }
  });

export default reducer;
