import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import { RecordLog } from '@foxpage/foxpage-client-types';

import * as ACTIONS from '@/store/actions/builder/recyclebin';

const initialState = {
  localList: [] as RecordLog[],
  localTotal: 0,
  remoteList: [] as RecordLog[],
  remoteTotal: 0,
};

type InitialDataType = typeof initialState;
type ReducerActionType = ActionType<typeof ACTIONS>;

const reducer = (state: InitialDataType = initialState, action: ReducerActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.setList): {
        const { list, total, remote = false } = action.payload;
        if (remote) {
          draft.remoteList = list;
          draft.remoteTotal = total;
        } else {
          draft.localList = list;
          draft.localTotal = total;
        }
        break;
      }
      case getType(ACTIONS.addNodes): {
        const { nodes, remote = false } = action.payload;
        if (remote) {
          draft.remoteList = draft.remoteList.concat(nodes);
          draft.remoteTotal = draft.remoteTotal + nodes.length;
        } else {
          draft.localList = draft.localList.concat(nodes);
          draft.localTotal = draft.localTotal + nodes.length;
        }
        break;
      }
      default:
        break;
    }
  });

export default reducer;
