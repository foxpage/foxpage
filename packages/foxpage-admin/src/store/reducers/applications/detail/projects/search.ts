import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/projects/search';
import { PaginationInfo, ProjectSearchEntity } from '@/types/index';

export type ApplicationProjectSearchActionType = ActionType<typeof ACTIONS>;

const list: ProjectSearchEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };

const initialState = {
  list,
  loading: false,
  pageInfo,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationProjectSearchActionType) =>
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

      case getType(ACTIONS.pushList): {
        const { result, pageInfo } = action.payload;
        draft.pageInfo = pageInfo;
        draft.list = result;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
