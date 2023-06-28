import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/notice';
import { Notice } from '@/types/index';

export type NoticeActionType = ActionType<typeof ACTIONS>;

const notices: Notice[] = [];
const initialState = {
  loading: false,
  notices,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: NoticeActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.pushNotices): {
        draft.notices = action.payload.list;
        break;
      }

      default:
        break;
    }
  });

export default reducer;
