import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as templateACTIONS from '@/actions/builder/template';
import { ComponentType } from '@/types/builder';

import * as ACTIONS from '../../actions/builder/component-list';

export type ListActionType = ActionType<typeof ACTIONS | typeof templateACTIONS>;

const componentList: ComponentType[] = [];
const initialState = {
  allComponent: componentList,
  fetchComponentListLoading: false,
};

type initialDataType = typeof initialState;

const reducer = (state: initialDataType = initialState, action: ListActionType) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(ACTIONS.updateComponentListLoading): {
        const { loading } = action.payload;
        draft.fetchComponentListLoading = loading;
        break;
      }
      case getType(ACTIONS.pushComponentList): {
        const { data } = action.payload;
        draft.allComponent = data;
        draft.fetchComponentListLoading = false;
        break;
      }

      case getType(templateACTIONS.clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }

      default:
        break;
    }
  });

export default reducer;
