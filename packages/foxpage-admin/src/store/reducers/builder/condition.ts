import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import { ConditionItem } from '@/types/application/condition';

export type ConditionActionType = ActionType<typeof ACTIONS>;

const list: ConditionItem[] = [];
const selectCondition: Partial<ConditionItem> = {};

const initialData = {
  fetching: false,
  list,
  total: 0,
  pageNum: 1,
  drawerVisible: false,
  drawerType: '',
  selectCondition,
};

type initialDataType = typeof initialData;

const conditionReducer = (state: initialDataType = initialData, action: ConditionActionType) =>
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
      case getType(ACTIONS.updateConditionDrawerVisible): {
        draft.drawerVisible = action.payload.status;
        draft.selectCondition = action.payload.condition || {};
        draft.drawerType = action.payload.type || '';
        break;
      }
      default:
        break;
    }
  });

export default conditionReducer;
