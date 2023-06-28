import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/record';
import { PaginationInfo, RecordLog, RecordStatus } from '@/types/index';

export type RecordActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const records: RecordLog[] = [];
const localRecords: RecordLog[] = [];
const nodeUpdateRecords: RecordLog[] = [];
const nodeUpdateIndex: number = -1;
const recordStatus: RecordStatus = {
  structure: {},
  variable: {},
  condition: {},
  function: {},
};
const initialState = {
  loading: false,
  localRecords,
  nodeUpdateRecords,
  nodeUpdateIndex,
  records,
  pageInfo,
  pageNum: 1,
  recordStatus,
};

const format = (logs: RecordLog[] = [], data: RecordStatus) => {
  logs.forEach((item) => {
    const contents = item.content;
    contents.forEach((content) => {
      if (data[content.type || 'default']) {
        data[content.type || 'default'][content.id] = true;
      }
    });
  });
  return data;
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: RecordActionType) =>
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

      case getType(ACTIONS.pushUserRecords): {
        draft.records = action.payload.data.data || [];
        draft.pageInfo = action.payload.data.pageInfo;
        break;
      }

      case getType(ACTIONS.updateNodeUpdateRecords): {
        draft.nodeUpdateRecords = action.payload.data || [];
        break;
      }

      case getType(ACTIONS.updateNodeUpdateRecordsIndex): {
        draft.nodeUpdateIndex = action.payload.index;
        break;
      }

      case getType(ACTIONS.updateLocalRecords): {
        const _list = action.payload.data.concat(draft.localRecords);
        draft.localRecords = _list;
        draft.recordStatus = format(_list, _.cloneDeep(draft.recordStatus));
        break;
      }

      case getType(ACTIONS.updateRemoteRecords): {
        const _list = draft.records.slice();
        const { index, record } = action.payload;
        _list.splice(index, 1, record);
        draft.records = _list;
        break;
      }

      case getType(ACTIONS.pushLocalRecords): {
        draft.localRecords = action.payload.data;
        draft.recordStatus = format(draft.localRecords, _.cloneDeep(draft.recordStatus));
        break;
      }

      case getType(ACTIONS.clearLocalRecord): {
        draft.localRecords = [];
        break;
      }

      case getType(ACTIONS.updatePageNum): {
        draft.pageNum = action.payload.num;
        break;
      }

      case getType(ACTIONS.pushUserRecordStatus): {
        draft.recordStatus = format(draft.localRecords, action.payload.data);
        break;
      }

      case getType(ACTIONS.updateStructureStatus): {
        const _cloned = _.cloneDeep(draft.recordStatus);
        _cloned.structure[action.payload.key] = true;
        draft.recordStatus = _cloned;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
