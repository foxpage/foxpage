import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/folder';
import { Application, AuthorizeListItem, PaginationInfo, ProjectEntity, User } from '@/types/index';

export type ProjectInvolvedFolderActionType = ActionType<typeof ACTIONS>;

const apps: Application[] = [];
const projectList: ProjectEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const editProject: ProjectEntity = {} as ProjectEntity;
const authList: AuthorizeListItem[] = [];
const userList: User[] = [];

const initialState = {
  apps,
  projectList,
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

const reducer = (state: InitialDataType = initialState, action: ProjectInvolvedFolderActionType) =>
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
        const { projectList = [], pageInfo } = action.payload;
        draft.projectList = projectList;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.pushApps): {
        const { data } = action.payload;
        draft.apps = data;
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
