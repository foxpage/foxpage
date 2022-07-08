import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/list';
import { Application, AuthorizeListItem, PaginationInfo, ProjectType, User } from '@/types/index';

export type ProjectListActionType = ActionType<typeof ACTIONS>;

const apps: Application[] = [];
const projectList: ProjectType[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const editProject: ProjectType = {} as ProjectType;
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

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: ProjectListActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      case getType(ACTIONS.pushApps): {
        const { data } = action.payload;
        draft.apps = data;
        break;
      }
      case getType(ACTIONS.pushProjectList): {
        const { projectList = [], pageInfo } = action.payload;
        draft.projectList = projectList;
        draft.pageInfo = pageInfo;
        draft.loading = false;
        break;
      }
      case getType(ACTIONS.setLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }
      case getType(ACTIONS.setSaveLoading): {
        const { loading } = action.payload;
        draft.saveLoading = loading;
        break;
      }
      case getType(ACTIONS.setAddDrawerOpenStatus): {
        const { drawerOpen = false, editProject = {} as ProjectType } = action.payload;
        draft.drawerOpen = drawerOpen;
        draft.editProject = editProject;
        break;
      }
      case getType(ACTIONS.updateEditProjectValue): {
        const { name, value } = action.payload;
        draft.editProject = Object.assign({}, draft.editProject, { [name]: value });
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
        const { visible = false, editProject = {} as ProjectType } = action.payload;
        draft.authListDrawerVisible = visible;
        draft.editProject = editProject;
        break;
      }
      case getType(ACTIONS.pushUserList): {
        draft.userList = action.payload.list;
        break;
      }
      default: {
        return state;
      }
    }
  });

export default reducer;
