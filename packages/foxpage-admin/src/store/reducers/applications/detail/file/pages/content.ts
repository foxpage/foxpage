import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/pages/content';
import { ContentEntity, PaginationInfo } from '@/types/index';

export type ApplicationPageContentActionType = ActionType<typeof ACTIONS>;

const pageInfo: PaginationInfo = {
  page: 1,
  size: 10,
  total: 0,
};
const list: ContentEntity[] = [];

const initialState = {
  pageInfo,
  list,
  loading: false,
};

export type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ApplicationPageContentActionType) =>
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

      case getType(ACTIONS.pushPageContentList): {
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
