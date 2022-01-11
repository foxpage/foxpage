import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/resource/detail';
import { ResourceGroupType } from '@/types/application';

export type AppResourceDetailActionType = ActionType<typeof ACTIONS>;

export interface StateType {
  // detail
  applicationId: string;
  folderPath: string;
  groupInfo: ResourceGroupType;
  // detail -list
  resLoading: boolean;
  resourceRootInfo: any;
  resourceList: any[];
  selectedRowKeys: string[];
  // folderDrawer
  folderDrawer: {
    open: boolean;
    type: 'add' | 'edit';
    data: any;
  };
  // fileDrawer
  fileDrawer: {
    open: boolean;
    type: 'add' | 'edit';
    data: any;
  };
}

const defaultState: StateType = {
  // detail
  applicationId: '',
  folderPath: '',
  groupInfo: {} as ResourceGroupType,
  // detail - list
  resLoading: false,
  resourceRootInfo: {},
  resourceList: [],
  selectedRowKeys: [],
  // folderDrawer
  folderDrawer: {
    open: false,
    type: 'add',
    data: {},
  },
  // fileDrawer
  fileDrawer: {
    open: false,
    type: 'add',
    data: {},
  },
};

const reducer = (state: StateType = defaultState, action: AppResourceDetailActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.resetResourcesDetailState): {
        return {
          ...defaultState,
        };
      }
      case getType(ACTIONS.updateResourcesDetailState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }
      case getType(ACTIONS.resetResourcesDetailFolderDrawerState): {
        draft.folderDrawer = defaultState.folderDrawer;
        break;
      }
      case getType(ACTIONS.updateResourcesDetailFolderDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.folderDrawer, params);
        break;
      }
      case getType(ACTIONS.resetResourcesDetailFileDrawerState): {
        draft.fileDrawer = defaultState.fileDrawer;
        break;
      }
      case getType(ACTIONS.updateResourcesDetailFileDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.fileDrawer, params);
        break;
      }
      default:
        break;
    }
  });

export default reducer;
