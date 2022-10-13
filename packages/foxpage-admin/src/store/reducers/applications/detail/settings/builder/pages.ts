import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/settings/builder/page';
import { ApplicationSettingBuilderComponent, PaginationInfo } from '@/types/index';

export type BuilderPageSettingsActionType = ActionType<typeof ACTIONS>;

const pages: ApplicationSettingBuilderComponent[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
const modal = {
  list: [],
  loading: false,
  pageInfo: {
    page: 1,
    total: 0,
    size: 10,
  },
  visible: false,
};

const initialState = {
  saving: false,
  loading: false,
  pages,
  pageInfo,
  searchText: '',
  modal,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: BuilderPageSettingsActionType) =>
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

      case getType(ACTIONS.updateModalState): {
        Object.assign(draft.modal, { ...action.payload.data });
        break;
      }

      case getType(ACTIONS.pushPages): {
        draft.pages = action.payload.data.data || [];
        draft.pageInfo = action.payload.data.pageInfo;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
