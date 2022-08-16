import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileType } from '@/constants/index';
import { Application, PaginationInfo, StorePackageResource, StoreProjectResource } from '@/types/index';

export type StoreResourceListActionType = ActionType<typeof ACTIONS>;

const selectedItem: StoreProjectResource = {} as StoreProjectResource;
const projectResourceList: StoreProjectResource[] = [];
const packageResourceList: StorePackageResource[] = [];
const variableResourceList: StorePackageResource[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 16, total: 0 };
const buyIds: string[] = [];
const applicationList: Application[] = [];
const allApplicationList: Application[] = [];

const initialState = {
  loading: false,
  previewModalVisible: false,
  projectResourceList,
  packageResourceList,
  variableResourceList,
  selectedItem,
  buyModalVisible: false,
  buyIds,
  pageInfo,
  searchText: '',
  selectedAppIds: buyIds,
  type: FileType.page,
  applicationList,
  allApplicationList,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: StoreResourceListActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.pushProjectResources): {
        const { list, pageInfo } = action.payload;
        draft.projectResourceList = list;
        draft.packageResourceList = [];
        draft.variableResourceList = [];
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.pushPackageResources): {
        const { list, pageInfo } = action.payload;
        draft.packageResourceList = list;
        draft.projectResourceList = [];
        draft.variableResourceList = [];
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.pushVariableResources): {
        const { list, pageInfo } = action.payload;
        draft.variableResourceList = list;
        draft.packageResourceList = [];
        draft.projectResourceList = [];
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.updateBuyModalVisible): {
        const { visible, ids } = action.payload;
        draft.buyIds = ids || [];
        draft.buyModalVisible = visible;
        break;
      }

      case getType(ACTIONS.updatePreviewModalVisible): {
        const { visible, resourceItem } = action.payload;
        draft.selectedItem = resourceItem;
        draft.previewModalVisible = visible;
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
        newResourceList.forEach((item) => {
          if (item.id === id) {
            item.checked = !item.checked;
          }
        });
        draft.projectResourceList = newResourceList;
        break;
      }

      case getType(ACTIONS.updatePackageResourceItemChecked): {
        const { id } = action.payload;
        const newResourceList = _.cloneDeep(draft.packageResourceList);
        newResourceList.forEach((item) => {
          if (item.id === id) {
            item.checked = !item.checked;
          }
        });
        draft.packageResourceList = newResourceList;
        break;
      }

      case getType(ACTIONS.updateVariableResourceItemChecked): {
        const { id } = action.payload;
        const newResourceList = _.cloneDeep(draft.variableResourceList);
        newResourceList.forEach((item) => {
          if (item.id === id) {
            item.checked = !item.checked;
          }
        });
        draft.variableResourceList = newResourceList;
        break;
      }

      case getType(ACTIONS.pushApplicationList): {
        draft.applicationList = action.payload.list || [];
        break;
      }

      case getType(ACTIONS.pushAllApplicationList): {
        draft.allApplicationList = action.payload.list;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
