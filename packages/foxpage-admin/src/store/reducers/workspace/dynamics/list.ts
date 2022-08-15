import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics/';
import { DynamicEntity, PaginationInfo } from '@/types/index';

export type DynamicActionType = ActionType<typeof ACTIONS>;

const dynamics: DynamicEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 1 };

const initialState = {
  loading: false,
  dynamics,
  pageInfo,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: DynamicActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushDynamics): {
        const { dynamics, pageInfo } = action.payload;
        draft.dynamics = dynamics;
        draft.pageInfo = pageInfo;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
