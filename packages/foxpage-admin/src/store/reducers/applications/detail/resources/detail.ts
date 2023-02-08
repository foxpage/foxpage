import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import { ApplicationResourceGroupDetailEntity, CommonDrawerEntity } from '@/types/index';

export type ApplicationResourceDetailActionType = ActionType<typeof ACTIONS>;

const groupInfo: ApplicationResourceGroupDetailEntity = {} as ApplicationResourceGroupDetailEntity;
const resourceRootInfo: any = {};
const resourceList: any[] = [];
const selectedRowKeys: string[] = [];
const folderDrawer: CommonDrawerEntity = {
  open: false,
  type: 'add',
  data: {},
};
const fileDrawer: CommonDrawerEntity = {
  open: false,
  type: 'add',
  data: {},
};

const initialState = {
  applicationId: '',
  folderPath: '',
  groupInfo,
  resLoading: false,
  resourceRootInfo,
  resourceList,
  selectedRowKeys,
  folderDrawer,
  fileDrawer,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationResourceDetailActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateFolderPath): {
        draft.folderPath = action.payload.folderPath || '';
        break;
      }

      case getType(ACTIONS.updateSelectedRowKeys): {
        draft.selectedRowKeys = action.payload.keys || [];
        break;
      }

      case getType(ACTIONS.updateResourcesDetailState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }

      case getType(ACTIONS.resetResourcesDetailFolderDrawerState): {
        draft.folderDrawer = initialState.folderDrawer;
        break;
      }

      case getType(ACTIONS.updateResourcesDetailFolderDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.folderDrawer, params);
        break;
      }

      case getType(ACTIONS.resetResourcesDetailFileDrawerState): {
        draft.fileDrawer = initialState.fileDrawer;
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
