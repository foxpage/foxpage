import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/settings/builder/component';
import { ApplicationSettingBuilderComponent, CategoryType, PaginationInfo } from '@/types/index';

export type BuilderComponentSettingsActionType = ActionType<typeof ACTIONS>;

const components: ApplicationSettingBuilderComponent[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
const editor: { status: boolean; data: ApplicationSettingBuilderComponent | null } = {
  status: false,
  data: null,
};
const categories: CategoryType[] = [];

const initialState = {
  saving: false,
  loading: false,
  components,
  pageInfo,
  searchText: '',
  editor,
  categories,
  // modal visible
  modalVisible: false,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: BuilderComponentSettingsActionType) =>
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

      case getType(ACTIONS.updateSaveLoading): {
        draft.saving = action.payload.loading;
        break;
      }

      case getType(ACTIONS.updatePageNum): {
        draft.pageInfo.page = action.payload.num;
        break;
      }

      case getType(ACTIONS.updateSearchText): {
        draft.searchText = action.payload.search;
        break;
      }

      case getType(ACTIONS.updateEditorVisible): {
        draft.editor.status = action.payload.status;
        draft.editor.data = action.payload.data;
        break;
      }

      case getType(ACTIONS.pushComponents): {
        draft.components = action.payload.data.data || [];
        draft.pageInfo = action.payload.data.pageInfo;
        break;
      }

      case getType(ACTIONS.pushCategories): {
        draft.categories = action.payload.list;
        break;
      }

      case getType(ACTIONS.updateModalVisible): {
        draft.modalVisible = action.payload.open;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
