import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/templates/list';
import { AuthorizeListItem, File, PaginationInfo, User } from '@/types/index';

export type ApplicationTemplateActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
const list: File[] = [];
const editFile: File = {} as File;
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  loading: false,
  saveLoading: false,
  pageInfo,
  editFile,
  authList,
  list,
  userList,
  drawerOpen: false,
  authListDrawerVisible: false,
  authListLoading: false,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationTemplateActionType) =>
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

      case getType(ACTIONS.pushApplicationTemplates): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        const { editFile = {} as File, drawerOpen = false } = action.payload;
        draft.drawerOpen = drawerOpen;
        draft.editFile = editFile;
        break;
      }

      case getType(ACTIONS.updateEditFileValue): {
        const { name, value } = action.payload;
        draft.editFile = Object.assign({}, draft.editFile, { [name]: value });
        break;
      }

      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editFile = {} as File } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editFile = editFile;
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

export default reducer;
