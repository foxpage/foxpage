import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { FileScope, FuncEntity, PaginationInfo } from '@/types/index';

export type FunctionActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: FuncEntity[] = [];
const editFunc: Partial<FuncEntity> = {};
const scope = 'application' as FileScope;

const initialState = {
  pageInfo,
  loading: false,
  list,
  drawerType: '',
  drawerVisible: false,
  editFunc,
  scope,
};

type InitialDataType = typeof initialState;

const functionReducer = (state: InitialDataType = initialState, action: FunctionActionType) =>
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

      case getType(ACTIONS.openEditDrawer): {
        draft.drawerType = action?.payload.type || '';
        draft.drawerVisible = action.payload.open;
        draft.editFunc = action.payload?.editFunc || editFunc;
        break;
      }

      case getType(ACTIONS.pushList): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
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

export default functionReducer;
