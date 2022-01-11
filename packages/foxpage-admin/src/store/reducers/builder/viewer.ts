import produce from 'immer';
import { ActionType, getType } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder';
import {
  clearLoadedResource,
  pushLoadedResource,
  pushNoResourceComponentName,
  updateLoadingStatus,
  updateRequireLoadStatus,
} from '@/actions/builder/component-load';
import { clearAll } from '@/actions/builder/condition';
import { clearAll as templateClearAll } from '@/actions/builder/template';

export type ComponentLoadActionType = ActionType<typeof ACTIONS | typeof clearAll>;

const noResourceComponentNames: string[] = [];
const initialState = {
  loadedComponent: {},
  loading: false,
  requireLoad: false,
  noResourceComponentNames,
};

const reducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case getType(pushLoadedResource): {
        const loadedComponent = Object.assign({}, draft.loadedComponent);
        const { loadResult, keys } = action.payload;
        keys.forEach((key, index: number) => {
          loadedComponent[key] = loadResult[index];
        });
        draft.loadedComponent = loadedComponent;
        break;
      }

      case getType(updateLoadingStatus): {
        const { value } = action.payload;
        draft.loading = value;
        break;
      }

      case getType(pushNoResourceComponentName): {
        const { names } = action.payload;
        draft.noResourceComponentNames = names;
        break;
      }

      case getType(clearLoadedResource): {
        draft.loadedComponent = {};
        break;
      }

      case getType(updateRequireLoadStatus): {
        const { status } = action.payload;
        draft.requireLoad = status;
        break;
      }

      case getType(templateClearAll):
      case getType(clearAll): {
        Object.assign(draft, { ...initialState });
        break;
      }
      default: {
        return state;
      }
    }
  });

export default reducer;
