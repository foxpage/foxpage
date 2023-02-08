import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/involved/search';
import { Application, PaginationInfo, ProjectSearchEntity } from '@/types/index';

export type ProjectInvolvedSearchActionType = ActionType<typeof ACTIONS>;

const appList: Application[] = [];
const list: ProjectSearchEntity[] = [];
const pageInfo: PaginationInfo = { page: 1, size: 10, total: 0 };

const initialState = {
  appList,
  list,
  loading: false,
  pageInfo,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ProjectInvolvedSearchActionType) =>
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

      case getType(ACTIONS.pushAPPList): {
        draft.appList = action.payload.data;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
