import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import { GetComponentSearchsProps } from '@/apis/group/application/packages';
import * as ACTIONS from '@/store/actions/group/application/packages/list';
import { AppComponentType, PaginationInfo } from '@/types/index';

export type AppComponentListActionType = ActionType<typeof ACTIONS>;

const componentList: AppComponentType[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
export interface ComponentDrawerType {
  open: boolean;
  type: '' | 'add' | 'edit';
  data: {
    [key: string]: any;
  };
}
const componentDrawer: ComponentDrawerType = {
  open: false,
  type: '',
  data: {},
};

const defaultState = {
  applicationId: '',
  selectPackage: '' as GetComponentSearchsProps['type'],
  componentList,
  pageInfo,
  loading: false,
  // drawer
  componentDrawer,
};

export type StateType = typeof defaultState;

const reducer = (state: StateType = defaultState, action: AppComponentListActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.resetListState): {
        return {
          ...defaultState,
        };
      }
      case getType(ACTIONS.updateListState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }
      case getType(ACTIONS.resetComponentDrawerState): {
        draft.componentDrawer = defaultState.componentDrawer;
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
