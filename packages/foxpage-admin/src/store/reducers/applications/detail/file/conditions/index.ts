import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { ConditionEntity, FileScope, PaginationInfo } from '@/types/index';

export type ConditionActionType = ActionType<typeof ACTIONS>;

const condition = {} as ConditionEntity;
const editCondition: Partial<ConditionEntity> = {};
const list: ConditionEntity[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const scope = 'application' as FileScope;

const initialState = {
  loading: false,
  pageInfo,
  list,
  drawerVisible: false,
  drawerType: '',
  condition,
  editCondition,
  scope,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ConditionActionType) =>
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

      case getType(ACTIONS.updatePaginationInfo): {
        draft.pageInfo = action.payload.pageInfo;
        break;
      }

      case getType(ACTIONS.pushList): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        draft.drawerType = action.payload?.type || '';
        draft.drawerVisible = action.payload.open;
        draft.editCondition = action.payload?.editCondition || editCondition;
        break;
      }

      case getType(ACTIONS.pushConditionDetail): {
        draft.condition = action.payload.condition;
        break;
      }

      case getType(ACTIONS.updateScope): {
        draft.scope = action.payload.scope;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
