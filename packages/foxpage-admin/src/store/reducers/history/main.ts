import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/history';
import { ContentVersion, HistoryRecord } from '@/types/index';

const historyRecords: HistoryRecord[] = [];
const versionsList: ContentVersion[] = [];
const initialState = {
  loading: false,
  historyRecords,
  versionsList,
  listIndex: 1,
};

type InitialDataType = typeof initialState;
export type RecordActionType = ActionType<typeof ACTIONS>;

const reducer = (state: InitialDataType = initialState, action: RecordActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.loading;
        break;
      }
      case getType(ACTIONS.pushHistories): {
        console.log('//', action.payload);
        draft.historyRecords = [...state.historyRecords, action.payload.data];
        break;
      }
      case getType(ACTIONS.updateVersionsList): {
        draft.versionsList = action.payload.list;
        break;
      }
      case getType(ACTIONS.resetHistory): {
        draft.historyRecords = initialState.historyRecords;
        draft.loading = initialState.loading;
        draft.versionsList = initialState.versionsList;
        break;
      }
      case getType(ACTIONS.updateListIndex): {
        draft.listIndex = action.payload.position;
        break;
      }
      default:
        break;
    }
  });

export default reducer;
