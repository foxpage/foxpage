import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/list';
import { Application, PaginationInfo } from '@/types/index';

export type ApplicationsActionType = ActionType<typeof ACTIONS>;

const applicationList: Application[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  size: 12,
  total: 1,
};
const editApp: Partial<Application> = {};

const initialState = {
  loading: false,
  applicationList,
  pageInfo,
  editDrawerVisible: false,
  editApp,
  saveLoading: false,
};

type InitialDataType = typeof initialState;

const homeReducer = (state: InitialDataType = initialState, action: ApplicationsActionType) =>
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
        draft.saveLoading = action.payload.loading;
        break;
      }

      case getType(ACTIONS.pushList): {
        draft.applicationList = action.payload.applicationList || [];
        draft.pageInfo = action.payload.pageInfo || pageInfo;
        break;
      }

      case getType(ACTIONS.updateApp): {
        const { key, value } = action.payload;
        draft.editApp[key] = value;
        break;
      }

      case getType(ACTIONS.updateValue): {
        const { key, value } = action.payload;
        draft[key] = value;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        draft.editDrawerVisible = action.payload.visible;
        break;
      }

      default:
        break;
    }
  });

export default homeReducer;
