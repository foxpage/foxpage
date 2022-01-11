import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/group/application/templates/list';
import { FileType } from '@/types/application/file';
import { PaginationInfo } from '@/types/index';

export type ApplicationTemplateActionType = ActionType<typeof ACTIONS>;

const list: FileType[] = [];
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

const reducer = (state: StateType = defaultState, action: ApplicationTemplateActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.pushApplicationTemplates): {
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
