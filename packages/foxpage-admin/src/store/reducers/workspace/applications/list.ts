import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { Application, PaginationInfo } from '@/types/index';

export type ApplicationsActionType = ActionType<typeof ACTIONS>;

const list: Application[] = [];
const pageInfo: PaginationInfo = {
  page: 1,
  size: 12,
  total: 1,
};
const editApp: Partial<Application> = {};

const initialData = {
  fetching: false,
  list,
  pageInfo,
  editDrawerVisible: false,
  saving: false,
  editApp,
};

type initialDataType = typeof initialData;

const homeReducer = (state: initialDataType = initialData, action: ApplicationsActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.updateFetching): {
        draft.fetching = action.payload.status;
        break;
      }
      case getType(ACTIONS.pushList): {
        draft.fetching = false;
        draft.list = action.payload.result.data || [];
        draft.pageInfo = action.payload.result.pageInfo || pageInfo;
        break;
      }
      case getType(ACTIONS.updateDrawerVisible): {
        draft.editDrawerVisible = action.payload.visible;
        break;
      }
      case getType(ACTIONS.updateApp): {
        const { key, value } = action.payload;
        draft.editApp[key] = value;
        break;
      }
      case getType(ACTIONS.updateValue): {
        const { key, value } = action.payload;
        draft[key] = value;
        break;
      }
      default:
        break;
    }
  });

export default homeReducer;
