import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/file';
import { AuthorizeListItem, File, PaginationInfo, ProjectEntity, User } from '@/types/index';

export type ProjectFileActionType = ActionType<typeof ACTIONS>;

const fileList: File[] = [];
const editFile: File = {} as File;
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const folder: ProjectEntity = {} as ProjectEntity;
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  loading: false,
  saveLoading: false,
  drawerOpen: false,
  fileList,
  pageInfo,
  editFile,
  folder,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ProjectFileActionType) =>
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

      case getType(ACTIONS.pushFileList): {
        const { fileList, pageInfo } = action.payload;
        draft.fileList = fileList;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.pushParentFiles): {
        draft.folder = action.payload.folder;
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
