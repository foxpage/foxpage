import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/components';
import { Component } from '@/types/component';
import { Content } from '@/types/index';

export type ComponentsActionType = ActionType<typeof ACTIONS>;

const components: Component[] = [];
const initialState = {
  components,
  blockDSLMap: {} as Record<string, Content>
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

      case getType(ACTIONS.pushBlockDSL): {
        draft.blockDSLMap = action.payload.data;
        break;
      }
      default:
        break;
    }
  });

export default reducer;
