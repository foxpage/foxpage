import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/recycleBin';
import { PaginationInfo, ProjectEntity } from '@/types/index';

export type RecycleActionType = ActionType<typeof ACTIONS>;

const projects: ProjectEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 1 };

const initialState = {
  loading: false,
  pageInfo,
  projects,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: RecycleActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.pushRecycle): {
        const { projects, pageInfo } = action.payload;
        draft.projects = projects;
        draft.pageInfo = pageInfo;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
