import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/function';
import { FuncItem } from '@/types/application/function';

export type FunctionActionType = ActionType<typeof ACTIONS>;

const list: FuncItem[] = [];
const selectFunc: Partial<FuncItem> = {};

const initialData = {
  fetching: false,
  list,
  total: 0,
  pageNum: 1,
  drawerVisible: false,
  drawerType: '',
  selectFunc,
};

type initialDataType = typeof initialData;

const functionReducer = (state: initialDataType = initialData, action: FunctionActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.changeOffset): {
        draft.pageNum = action.payload.num;
        break;
      }
      case getType(ACTIONS.updateLoading): {
        draft.fetching = action.payload.status;
        break;
      }
      case getType(ACTIONS.pushList): {
        draft.list = action.payload.result.data || [];
        draft.total = action.payload.result.pageInfo.total || 0;
        break;
      }
      case getType(ACTIONS.updateFunctionDrawerVisible): {
        draft.drawerVisible = action.payload.status;
        draft.selectFunc = action.payload.func || {};
        draft.drawerType = action.payload.type || '';
        break;
      }
      default:
        break;
    }
  });

export default functionReducer;
