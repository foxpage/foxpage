import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/index';
import { Application, PaginationInfo, StorePackageResource, StoreProjectResource } from '@/types/index';

export type StoreResourceListActionType = ActionType<typeof ACTIONS>;

const selectedItem: StoreProjectResource = {} as StoreProjectResource;
const projectResourceList: StoreProjectResource[] = [];
const packageResourceList: StorePackageResource[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 12, total: 0 };
const buyIds: string[] = [];
const allApplication: Application[] = [];
const initialState = {
  loading: false,
  previewModalVisible: false,
  projectResourceList,
  packageResourceList,
  selectedItem,
  buyModalVisible: false,
  buyIds,
  pageInfo,
  searchText: '',
  selectedAppIds: buyIds,
  type: FileTypeEnum.page,
  allApplication,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: StoreResourceListActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.pushProjectStoreResources): {
        const { list, pageInfo } = action.payload;
        draft.projectResourceList = list;
        draft.packageResourceList = [];
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.pushPackageStoreResources): {
        const { list, pageInfo } = action.payload;
        draft.projectResourceList = [];
        draft.packageResourceList = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.updatePreviewModalVisible): {
        const { visible, resourceItem } = action.payload;
        draft.selectedItem = resourceItem;
        draft.previewModalVisible = visible;
        break;
      }

      case getType(ACTIONS.updateBuyModalVisible): {
        const { visible, ids } = action.payload;
        draft.buyIds = ids || [];
        draft.buyModalVisible = visible;
        break;
      }

      case getType(ACTIONS.updateSearchText): {
        const { text } = action.payload;
        draft.searchText = text;
        break;
      }

      case getType(ACTIONS.updateSelectedAppIds): {
        const { ids } = action.payload;
        draft.selectedAppIds = ids;
        break;
      }

      case getType(ACTIONS.updateType): {
        const { type } = action.payload;
        draft.type = type;
        break;
      }

      case getType(ACTIONS.updateProjectResourceItemChecked): {
        const { id } = action.payload;
        const newResourceList = _.cloneDeep(draft.projectResourceList);
        newResourceList.forEach(item => {
          if (item.id === id) {
            item.checked = !item.checked;
          }
        });
        draft.projectResourceList = newResourceList;
        break;
      }

      case getType(ACTIONS.pushAllApplicationList): {
        const { list } = action.payload;
        draft.allApplication = list;
        break;
      }

      case getType(ACTIONS.updatePackageResourceItemChecked): {
        const { id } = action.payload;
        const newResourceList = _.cloneDeep(draft.packageResourceList);
        newResourceList.forEach(item => {
          if (item.id === id) {
            item.checked = !item.checked;
          }
        });
        draft.packageResourceList = newResourceList;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        break;
    }
  });

export default reducer;
