import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/packages/detail';
import {
  CommonDrawerEntity,
  ComponentEditVersionEntity,
  ComponentInfoEntity,
  ComponentRemote,
  ComponentVersionEntity,
  File,
  PaginationInfo,
} from '@/types/index';

export type ApplicationPackagesDetailActionType = ActionType<typeof ACTIONS>;

const fileDetail: File = {} as File;
const componentInfo: ComponentInfoEntity = {} as ComponentInfoEntity;
const versionDrawer: CommonDrawerEntity = { open: false, type: 'add', data: {} };
const cloudSyncDrawer = {
  open: false,
  loading: false,
  componentRemote: {} as ComponentRemote,
  lastVersion: {} as ComponentEditVersionEntity,
};
const versionList = {
  applicationId: '',
  fileId: '',
  loading: false,
  versions: [] as ComponentVersionEntity[],
  pageInfo: { total: 0, page: 1, size: 10 } as PaginationInfo,
};
const depList = {
  list: [] as any[],
};

const initialState = {
  fileDetail,
  cloudSyncDrawer,
  compInfoLoading: false,
  componentInfo,
  versionList,
  versionDrawer,
  depList,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPackagesDetailActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateDetailState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }

      case getType(ACTIONS.resetComponentInfoState): {
        draft.componentInfo = initialState.componentInfo;
        break;
      }

      case getType(ACTIONS.updateComponentInfoState): {
        const { params = {} } = action.payload;
        Object.assign(draft.componentInfo, params);
        break;
      }

      case getType(ACTIONS.resetVersionListState): {
        draft.versionList = initialState.versionList;
        break;
      }

      case getType(ACTIONS.updateVersionListState): {
        const { params = {} } = action.payload;
        Object.assign(draft.versionList, params);
        break;
      }

      case getType(ACTIONS.resetVersionDrawerState): {
        draft.versionDrawer = initialState.versionDrawer;
        break;
      }

      case getType(ACTIONS.updateVersionDrawerState): {
        const { params = {} } = action.payload;
        Object.assign(draft.versionDrawer, params);
        break;
      }

      case getType(ACTIONS.updateCloudSyncDrawerOpenStatus): {
        const { open } = action.payload;
        if (!open) {
          draft.cloudSyncDrawer = initialState.cloudSyncDrawer;
        } else {
          draft.cloudSyncDrawer.open = open;
        }
        break;
      }

      case getType(ACTIONS.updateCloudSyncDrawerLoadingStatus): {
        const { open } = action.payload;
        draft.cloudSyncDrawer.loading = open;
        break;
      }

      case getType(ACTIONS.updateComponentOnlineStatus): {
        const { online } = action.payload;
        const componentInfo = Object.assign({}, draft.componentInfo);
        componentInfo.online = online;
        draft.componentInfo = componentInfo;
        break;
      }

      case getType(ACTIONS.fetchComponentRemotes): {
        draft.cloudSyncDrawer.loading = true;
        break;
      }

      case getType(ACTIONS.pushComponentRemotes): {
        const { remote, lastVersion } = action.payload;
        draft.cloudSyncDrawer.componentRemote = remote;
        draft.cloudSyncDrawer.lastVersion = lastVersion;
        draft.cloudSyncDrawer.loading = false;
        break;
      }

      case getType(ACTIONS.pushFileDetail): {
        const { data } = action.payload;
        draft.fileDetail = data as unknown as File;
        break;
      }

      case getType(ACTIONS.pushComponentUsed): {
        draft.depList.list = action.payload.list;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
