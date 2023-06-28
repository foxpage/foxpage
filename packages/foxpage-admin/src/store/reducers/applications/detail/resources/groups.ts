import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/groups';
import { ApplicationResourceGroupEntity } from '@/types/index';

export type AppResourceGroupsActionType = ActionType<typeof ACTIONS>;

const groupList: ApplicationResourceGroupEntity[] = [];
const editGroup: ApplicationResourceGroupEntity = {} as ApplicationResourceGroupEntity;

const initialState = {
  loading: false,
  groupList,
  drawerOpen: false,
  editGroup,
  resourceUrl: '',
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: AppResourceGroupsActionType) =>
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

      case getType(ACTIONS.pushResourcesGroups): {
        draft.groupList = action.payload.groupList;
        break;
      }

      case getType(ACTIONS.updateResourcesGroupsState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }

      case getType(ACTIONS.resetResourcesEditDrawerState): {
        draft.drawerOpen = false;
        draft.editGroup = {} as ApplicationResourceGroupEntity;
        draft.resourceUrl = '';
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        const { open, editGroup } = action.payload;

        draft.drawerOpen = open || false;
        draft.editGroup = editGroup || ({} as ApplicationResourceGroupEntity);
        break;
      }

      case getType(ACTIONS.pushResourcesRemoteUrl): {
        draft.resourceUrl = action.payload.url || '';
        break;
      }

      default:
        break;
    }
  });

export default reducer;
