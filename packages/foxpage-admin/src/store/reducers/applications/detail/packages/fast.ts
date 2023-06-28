import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/packages/fast';
import { PaginationInfo, RemoteComponentItem, RemoteResourceSavedData } from '@/types/index';

export type ApplicationPackagesFastActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 1000,
};
const packages: RemoteComponentItem[] = [];
const changes: Record<string, Record<string, string>> = {};
const checkedList: string[] = [];
const savedResources: RemoteResourceSavedData = {};

const initialData = {
  loading: false,
  saving: false,
  checkedList,
  groupId: '',
  searchName: '',
  pageInfo,
  packages,
  changes,
  savedResources,
};

export type StateType = typeof initialData;

const reducer = (state: StateType = initialData, action: ApplicationPackagesFastActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateSaving): {
        draft.saving = action.payload.status;
        break;
      }
      case getType(ACTIONS.selectGroup): {
        draft.groupId = action.payload.id;
        break;
      }
      case getType(ACTIONS.pushPackages): {
        const { list = [], pageInfo } = action.payload;
        draft.packages = list;
        if (pageInfo) {
          draft.pageInfo = pageInfo;
        }
        break;
      }
      case getType(ACTIONS.updateSelected): {
        draft.checkedList = action.payload.selected;
        break;
      }
      case getType(ACTIONS.updateSearchName): {
        draft.searchName = action.payload.name;
        break;
      }
      case getType(ACTIONS.updateChanges): {
        const { componentName, params } = action.payload;
        draft.changes = { [componentName]: params };
        break;
      }
      case getType(ACTIONS.clearChanges): {
        draft.changes = {};
        break;
      }
      case getType(ACTIONS.pushResourcesSaved): {
        const { data } = action.payload;
        draft.savedResources = data;
        break;
      }
      case getType(ACTIONS.updateComponentRemoteInfo): {
        const { name, info } = action.payload;
        const pkg = draft.packages.find((item) => item.components[0].resource.name === name);
        if (pkg && info.componentType) {
          pkg.components[0].componentType = info.componentType;
        }
        break;
      }
      default:
        break;
    }
  });

export default reducer;
