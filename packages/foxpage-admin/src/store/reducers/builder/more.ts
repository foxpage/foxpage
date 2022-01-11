import produce from 'immer';
import _ from 'lodash';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/more';
import { clearAll } from '@/actions/builder/template';
import { DslType } from '@/types/builder';

export type MoreActionType = ActionType<typeof ACTIONS | typeof clearAll>;

const dsl: DslType = {} as DslType;
const initialState = {
  dsl,
  dslModalOpen: false,
  loading: false,
};

const reducer = (state = initialState, action: MoreActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.updateDslModalOpen): {
        const { open } = action.payload;
        draft.dslModalOpen = open;
        break;
      }

      case getType(ACTIONS.updateLoading): {
        const { loading } = action.payload;
        draft.loading = loading;
        break;
      }

      case getType(ACTIONS.pushDsl): {
        const { dsl } = action.payload;
        draft.dsl = dsl;
        break;
      }

      case getType(clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        return state;
    }
  });

export default reducer;
