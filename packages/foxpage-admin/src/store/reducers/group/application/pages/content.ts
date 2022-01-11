import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/group/application/pages/content';
import { ContentType } from '@/types/application/content';
import { PaginationInfo } from '@/types/index';

export type PageContentActionType = ActionType<typeof ACTIONS>;

const list: ContentType[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  total: 0,
  size: 10,
};
const defaultState = {
  loading: false,
  list,
  pageInfo,
};

export type StateType = typeof defaultState;

const reducer = (state: StateType = defaultState, action: PageContentActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushPageContentList): {
        const { list = [], pageInfo } = action.payload;
        draft.list = list;
        draft.pageInfo = pageInfo;
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...defaultState });
        break;
      }

      default:
        break;
    }
  });

export default reducer;
