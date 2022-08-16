import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/folder';
import { Application, PaginationInfo, ProjectEntity } from '@/types/index';

export type ProjectFolderActionType = ActionType<typeof ACTIONS>;

const apps: Application[] = [];
const projectList: ProjectEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const editProject: ProjectEntity = {} as ProjectEntity;

const initialState = {
  loading: false,
  drawerOpen: false,
  pageInfo,
  projectList,
  editProject,
  saveLoading: false,
  apps,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ProjectFolderActionType) =>
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

      case getType(ACTIONS.updateLoading): {
        draft.loading = action.payload.status;
        break;
      }

      case getType(ACTIONS.updateSaveLoading): {
        draft.saveLoading = action.payload.status;
        break;
      }

      case getType(ACTIONS.openEditDrawer): {
        const { open = false, editProject = {} as ProjectEntity } = action.payload;
        draft.drawerOpen = open;
        draft.editProject = editProject;
        break;
      }
      case getType(ACTIONS.updateEditProjectValue): {
        const { name, value } = action.payload;
        draft.editProject = Object.assign({}, draft.editProject, { [name]: value });
        break;
      }

      default: {
        return state;
      }
    }
  });

export default reducer;
