import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list';
import { Application, PaginationInfo } from '@/types/index';

export type ApplicationActionType = ActionType<typeof ACTIONS>;

const list: Application[] = [];
const pageInfo: PaginationInfo = {
  page: 0,
  size: 10,
  total: 0,
};
const editApp: Partial<Application> = {};
const initialData = {
  fetching: false,
  saving: false,
  list,
  pageInfo,
  editDrawerVisible: false,
  editApp,
};

type initialDataType = typeof initialData;

const homeReducer = (state: initialDataType = initialData, action: ApplicationActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialData });
        break;
      }
      case getType(ACTIONS.updateFetching): {
        draft.fetching = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateSaving): {
        draft.saving = action.payload.status;
        break;
      }
      case getType(ACTIONS.updateValue): {
        const { key, value } = action.payload;
        draft[key] = value;
        break;
      }
      case getType(ACTIONS.updateApp): {
        const { key, value } = action.payload;
        draft.editApp[key] = value;
        break;
      }
      case getType(ACTIONS.pushAppList): {
        draft.fetching = false;
        draft.list = action.payload.result.data || [];
        draft.pageInfo = action.payload.result.pageInfo || pageInfo;
        break;
      }
      case getType(ACTIONS.changePageNum): {
        draft.pageInfo.page = action.payload.pageNo;
        break;
      }
      case getType(ACTIONS.updateDrawerVisible): {
        draft.editDrawerVisible = action.payload.visible;
        draft.editApp = action.payload.app || {};
        break;
      }
      default:
        break;
    }
  });

export default homeReducer;
