import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects';
import { PaginationInfo } from '@/types/common';
import { ProjectType } from '@/types/project';

export type ProjectsActionType = ActionType<typeof ACTIONS>;

interface StateType {
  projects: ProjectType[];
  loading: boolean;
  pageInfo: PaginationInfo;
}
const initialState = {
  loading: false,
  projects: [],
  pageInfo: { page: 1, size: 12, total: 1 },
};

const reducer = (state: StateType = initialState, action: ProjectsActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushMyProjects): {
        const { projects, pageInfo } = action.payload;
        draft.pageInfo = pageInfo;
        draft.projects = projects;
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        break;
    }
  });

export default reducer;
