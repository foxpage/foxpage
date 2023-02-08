import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/personal/folder';
import {
  Application,
  AuthorizeListItem,
  ContentEntity,
  File,
  PaginationInfo,
  ProjectEntity,
  User,
} from '@/types/index';

export type ProjectListActionType = ActionType<typeof ACTIONS>;

const apps: Application[] = [];
const allApps: Application[] = [];
const projectList: ProjectEntity[] = [];
const fileList: File[] = [];
const contentList: ContentEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const editProject: ProjectEntity = {} as ProjectEntity;
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  allApps,
  apps,
  projectList,
  fileList,
  contentList,
  pageInfo,
  loading: false,
  drawerOpen: false,
  editProject,
  saveLoading: false,
  authListDrawerVisible: false,
  authListLoading: false,
  authList,
  userList,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ProjectListActionType) =>
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

      case getType(ACTIONS.pushProjectList): {
        const { result, pageInfo } = action.payload;
        draft.pageInfo = pageInfo;

        if (Array.isArray(result)) {
          draft.projectList = result || [];
        } else {
          draft.projectList = result?.folders || [];
          draft.fileList = result?.files || [];
          draft.contentList = result?.contents || [];
        }

        break;
      }

      case getType(ACTIONS.pushApps): {
        draft.apps = action.payload.data;
        break;
      }

      case getType(ACTIONS.pushAllApps): {
        draft.allApps = action.payload.data;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        const { drawerOpen = false, editProject = {} as ProjectEntity } = action.payload;
        draft.drawerOpen = drawerOpen;
        draft.editProject = editProject;
        break;
      }

      case getType(ACTIONS.updateEditProjectValue): {
        const { name, value } = action.payload;
        draft.editProject = Object.assign({}, draft.editProject, { [name]: value });
        break;
      }

      case getType(ACTIONS.updateAuthDrawerVisible): {
        const { visible = false, editProject = {} as ProjectEntity } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editProject = editProject;
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
