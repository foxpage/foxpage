import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { Application, AuthorizeListItem, PaginationInfo, User } from '@/types/index';

export type ApplicationsActionType = ActionType<typeof ACTIONS>;

const applicationList: Application[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 1,
};
const editApp: Partial<Application> = {};
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  loading: false,
  applicationList,
  pageInfo,
  editDrawerVisible: false,
  editApp,
  saveLoading: false,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
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
        draft.loading = action.payload.loading;
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
        draft.editApp = action.payload.app || {};
        break;
      }

      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editApp = {} as Application } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editApp = editApp;
        break;
      }

      case getType(ACTIONS.updateAuthListLoading): {
        draft.authListLoading = action.payload.status;
        break;
      }

      case getType(ACTIONS.pushAuthList): {
        draft.authList = action.payload.list;
        break;
      }

      case getType(ACTIONS.pushUserList): {
        draft.userList = action.payload.list;
        break;
      }

      default:
        break;
    }
  });

export default homeReducer;
