import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/packages/list';
import { AppComponentFetchParams, CommonDrawerEntity, ComponentEntity, PaginationInfo } from '@/types/index';

export type ApplicationPackagesActionType = ActionType<typeof ACTIONS>;

const componentList: ComponentEntity[] = [];
const blockList: ComponentEntity[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
const componentDrawer: CommonDrawerEntity = {
  open: false,
  data: {},
};

const initialState = {
  loading: false,
  pageInfo,
  componentList,
  blockList,
  applicationId: '',
  search: '',
  selectPackage: '' as AppComponentFetchParams['type'],
  // drawer
  componentDrawer,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPackagesActionType) =>
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

      case getType(ACTIONS.updateListState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }

      case getType(ACTIONS.resetComponentDrawerState): {
        draft.componentDrawer = initialState.componentDrawer;
        break;
      }

      case getType(ACTIONS.updateComponentDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.componentDrawer, params);
        break;
      }

      default:
        break;
    }
  });

export default reducer;
