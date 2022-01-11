import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/resource/groups';
import { ResourceGroup } from '@/types/application';

export type AppResourceGroupsActionType = ActionType<typeof ACTIONS>;

export interface StateType {
  loading: boolean;
  groupList: ResourceGroup[];
  editDrawer: {
    drawerOpen: boolean;
    group?: ResourceGroup;
  };
}

const defaultState: StateType = {
  loading: false,
  groupList: [],
  editDrawer: {
    drawerOpen: false,
  },
};

const reducer = (state: StateType = defaultState, action: AppResourceGroupsActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.resetResourcesGroupsState): {
        return {
          ...defaultState,
        };
      }
      case getType(ACTIONS.updateResourcesGroupsState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }
      case getType(ACTIONS.resetResourcesEditDrawerState): {
        draft.editDrawer = defaultState.editDrawer;
        break;
      }
      case getType(ACTIONS.updateResourcesEditDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.editDrawer, params);
        break;
      }
      default:
        break;
    }
  });

export default reducer;
