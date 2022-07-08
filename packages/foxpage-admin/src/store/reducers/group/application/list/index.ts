import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import { Application, AuthorizeListItem, PaginationInfo, User } from '@/types/index';

export type ApplicationActionType = ActionType<typeof ACTIONS>;

const list: Application[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const editApp: Partial<Application> = {};
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialData = {
  fetching: false,
  saving: false,
  list,
  pageInfo,
  editDrawerVisible: false,
  editApp,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
};

type initialDataType = typeof initialData;

const homeReducer = (state: initialDataType = initialData, action: ApplicationActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.updateFetching): {
        draft.fetching = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateSaving): {
        draft.saving = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateValue): {
        const { key, value } = action.payload;
        draft[key] = value;
        break;
      }
      case getType(ACTIONS.updateApp): {
        const { key, value } = action.payload;
        draft.editApp[key] = value;
        break;
      }
      case getType(ACTIONS.pushAppList): {
        draft.fetching = false;
        draft.list = action.payload.result.data || [];
        draft.pageInfo = action.payload.result.pageInfo || pageInfo;
        break;
      }
      case getType(ACTIONS.changePageNum): {
        draft.pageInfo.page = action.payload.pageNo;
        break;
      }
      case getType(ACTIONS.updateDrawerVisible): {
        draft.editDrawerVisible = action.payload.visible;
        draft.editApp = action.payload.app || {};
        break;
      }
      case getType(ACTIONS.pushAuthList): {
        draft.authList = action.payload.list;
        break;
      }
      case getType(ACTIONS.updateAuthListLoading): {
        draft.authListLoading = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editApp = {} as Partial<Application> } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editApp = editApp;
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
