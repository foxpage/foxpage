import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/list';
import { Application, PaginationInfo } from '@/types/index';
import { ProjectType } from '@/types/project';

export type ProjectListActionType = ActionType<typeof ACTIONS>;

const apps: Application[] = [];
const projectList: ProjectType[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };
const editProject: ProjectType = {} as ProjectType;
const initialState = {
  apps,
  projectList,
  pageInfo,
  loading: false,
  drawerOpen: false,
  editProject,
  saveLoading: false,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: ProjectListActionType) =>
  produce(state, draft => {
    switch (action.type) {
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
        const { editProject = {} as ProjectType, drawerOpen = false } = action.payload;
        draft.drawerOpen = drawerOpen;
        draft.editProject = editProject;
        break;
      }
      case getType(ACTIONS.updateEditProjectValue): {
        const { name, value } = action.payload;
        const editProject = Object.assign({}, draft.editProject, { [name]: value });

        draft.editProject = editProject;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      default: {
        return state;
      }
    }
  });

export default reducer;
