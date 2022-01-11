import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import {
  AppComponentEditVersionType,
  AppComponentInfoType,
  AppComponentVersionType,
  ComponentRemote,
} from '@/types/application';
import { FileType } from '@/types/application/file';
import { PaginationInfo } from '@/types/index';

export type AppComponentDetailActionType = ActionType<typeof ACTIONS>;

interface VersionDrawer {
  open: boolean;
  type?: 'view' | 'edit' | 'add';
  data: {
    versionId?: string | undefined;
  };
}

const fileDetail: FileType = {} as FileType;

export interface StateType {
  compInfoLoading: boolean;
  componentInfo: AppComponentInfoType;
  versionDrawer: VersionDrawer;
  fileDetail?: FileType;
  cloudSyncDrawer: {
    open: boolean;
    loading: boolean;
    componentRemotes: ComponentRemote[];
    lastVersion?: AppComponentEditVersionType;
  };
  versionList: {
    applicationId: string;
    fileId: string;
    loading: boolean;
    versions: AppComponentVersionType[];
    pageInfo: PaginationInfo;
  };
}
const defaultState = {
  compInfoLoading: false,
  componentInfo: {} as AppComponentInfoType,
  versionList: {
    applicationId: '',
    fileId: '',
    loading: false,
    versions: [] as AppComponentVersionType[],
    pageInfo: {
      total: 0,
      page: 1,
      size: 10,
    },
  },
  cloudSyncDrawer: {
    open: false,
    loading: false,
    componentRemotes: [],
  },
  versionDrawer: {
    open: false,
    data: {},
  } as VersionDrawer,
  fileDetail,
};

const reducer = (state: StateType = defaultState, action: AppComponentDetailActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.resetDetailState): {
        return {
          ...defaultState,
        };
      }
      case getType(ACTIONS.updateDetailState): {
        const { params = {} } = action.payload;
        Object.assign(draft, params);
        break;
      }
      case getType(ACTIONS.resetComponentInfoState): {
        draft.componentInfo = defaultState.componentInfo;
        break;
      }
      case getType(ACTIONS.updateComponentInfoState): {
        const { params = {} } = action.payload;
        Object.assign(draft.componentInfo, params);
        break;
      }
      case getType(ACTIONS.resetVersionListState): {
        draft.versionList = defaultState.versionList;
        break;
      }
      case getType(ACTIONS.updateVersionListState): {
        const { params = {} } = action.payload;
        Object.assign(draft.versionList, params);
        break;
      }
      case getType(ACTIONS.resetVersionDrawerState): {
        draft.versionDrawer = defaultState.versionDrawer;
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
          draft.cloudSyncDrawer = defaultState.cloudSyncDrawer;
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
        const { remotes, lastVersion } = action.payload;
        draft.cloudSyncDrawer.componentRemotes = remotes;
        draft.cloudSyncDrawer.lastVersion = lastVersion;
        draft.cloudSyncDrawer.loading = false;
        break;
      }
      case getType(ACTIONS.pushFileDetail): {
        const { data } = action.payload;
        draft.fileDetail = data;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
