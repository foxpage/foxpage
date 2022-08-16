import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/components';
import { Component } from '@/types/component';

export type ComponentsActionType = ActionType<typeof ACTIONS>;

const components: Component[] = [];
const initialState = {
  components,
};

type InitialDataType = typeof initialState;

const reducer = (state: InitialDataType = initialState, action: ComponentsActionType) =>
  produce(state, (draft) => {
    switch (action.type) {
      case getType(ACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      case getType(ACTIONS.pushComponentList): {
        draft.components = action.payload.data;
        break;
      }
      default:
        break;
    }
  });

export default reducer;
