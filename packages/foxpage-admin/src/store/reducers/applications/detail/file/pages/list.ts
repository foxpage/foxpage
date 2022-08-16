import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/list';
import { File, PaginationInfo } from '@/types/index';

export type ApplicationPageActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: File[] = [];

const initialState = {
  pageInfo,
  list,
  loading: false,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPageActionType) =>
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

      case getType(ACTIONS.pushApplicationPages): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
