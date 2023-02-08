import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/data/list';

export type DataActionType = ActionType<typeof ACTIONS>;

const collections: string[] = [];
const result: any[] = [];
const initialState = {
  loading: false,
  collections,
  result,
};

type InitialDataType = typeof initialState;

const conditionReducer = (state: InitialDataType = initialState, action: DataActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.pushCollectionList): {
        draft.collections = action.payload.list;
        break;
      }

      case getType(ACTIONS.pushDataBaseResult): {
        draft.result = action.payload.result;
        break;
      }

      default:
        break;
    }
  });

export default conditionReducer;
