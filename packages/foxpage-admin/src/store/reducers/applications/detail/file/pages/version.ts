import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/applications/detail/file/pages/version';
import { ContentVersionData, PaginationInfo } from '@/types/index';

export type ApplicationPageHistoryActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: ContentVersionData[] = [];

const initialState = {
  loading: false,
  pageInfo,
  list,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPageHistoryActionType) =>
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

      case getType(ACTIONS.pushVersions): {
        const { data = [], pageInfo } = action.payload.data;
        draft.list = data;
        draft.pageInfo = pageInfo;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
